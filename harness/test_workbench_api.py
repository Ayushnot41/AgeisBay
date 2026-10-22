import importlib
import sys
import json
import pytest
from fastapi.testclient import TestClient
from services.mediator.tinyfish_sentinel import TinyFishSentinel

@pytest.fixture
def api(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "ledger.db"))
    monkeypatch.setenv("CHECKPOINT_EXPORT_PATH", str(tmp_path / "checkpoint.json"))
    monkeypatch.setenv("KEY_DIR", str(tmp_path / "keys"))
    monkeypatch.setenv("TINYFISH_API_KEY", "")
    sys.modules.pop("services.mediator.app", None)
    module = importlib.import_module("services.mediator.app")
    with TestClient(module.app) as client:
        yield client, module

def test_empty_ledger_reports_no_invented_evidence(api):
    client, _ = api
    stats = client.get("/api/telemetry/stats").json()
    assert stats["total_runs"] == 0
    assert stats["ledger_verification"] == "EMPTY"
    assert stats["p50_padded_ms"] is None
    assert stats["timing_attack_auc"] is None
    assert stats["seccomp_enforced"] is None
    assert client.get("/api/experiments/matrix").json()["matrix"] == []

def test_invalid_mode_cannot_silently_select_baseline(api):
    client, _ = api
    assert client.post("/api/runs/dispatch", json={"mode":"HARDEND"}).status_code == 422
    assert client.post("/api/runs/dispatch", json={"fault_class":"UNKNOWN"}).status_code == 400
    assert client.post("/api/runs/dispatch", json={"prompt":""}).status_code == 422

def test_paired_results_verify_and_restore_after_repeated_tamper(api):
    client, _ = api
    response=client.post("/api/experiments/paired")
    assert response.status_code == 200
    matrix=client.get("/api/experiments/matrix").json()["matrix"]
    assert len(matrix) == 7
    assert sum(row["hardened"]["score_contributed"] for row in matrix) == 1
    runs=client.get("/api/runs").json()
    assert len(runs) == 14
    run_id=runs[0]["run_id"]
    assert client.get(f"/api/runs/{run_id}/verify").json()["valid"]
    for _ in range(2):
        assert client.post("/api/tamper/simulate",json={"run_id":run_id}).status_code == 200
    verification=client.get(f"/api/runs/{run_id}/verify").json()
    assert not verification["valid"]
    assert not verification["leaves"]["leaf_03_valid"]
    assert verification["leaves"]["leaf_02_valid"]
    assert verification["sig_valid"] # Stored root signature remains valid; records do not.
    assert client.get("/api/telemetry/stats").json()["ledger_verification"] == "TAMPER_DETECTED"
    assert client.post("/api/tamper/restore",json={"run_id":run_id}).status_code == 200
    assert client.get(f"/api/runs/{run_id}/verify").json()["valid"]

def test_unflagged_database_corruption_is_detected(api):
    client,module=api
    client.post("/api/experiments/paired")
    run=client.get("/api/runs").json()[0]
    with module.ledger._connection() as connection:
        records=run["raw_records"]
        records["result"]["safety_score"]=0.123
        connection.execute("UPDATE runs SET raw_records_json=? WHERE run_id=?",(json.dumps(records),run["run_id"]))
        connection.commit()
    assert client.get("/api/telemetry/stats").json()["ledger_verification"] == "TAMPER_DETECTED"

def test_matrix_does_not_mix_independent_runs(api):
    client,module=api
    import asyncio
    asyncio.run(module.runner.execute_run(mode="BASELINE",experiment_id="one",simulate_real_sleep=False))
    asyncio.run(module.runner.execute_run(mode="HARDENED",experiment_id="two",simulate_real_sleep=False))
    assert client.get("/api/experiments/matrix").json()["matrix"] == []

def test_missing_receipt_and_topology(api):
    client,_=api
    assert client.get("/api/runs/missing/verify").status_code == 404
    topology=client.get("/api/topology/dag").json()
    assert topology["nodes"] and topology["edges"]

def test_tinyfish_simulation_does_not_claim_live_verification(tmp_path,monkeypatch):
    monkeypatch.delenv("TINYFISH_API_KEY",raising=False)
    sentinel=TinyFishSentinel(config_path=str(tmp_path/"missing.json"))
    assert sentinel.get_status()["status"] == "UNCONFIGURED"
    result=sentinel.execute_boundary_egress_probe("test_canary")
    assert result["mode"] == "SIMULATION"
    assert result["tinyfish_sentinel_verified"] is False
    assert sentinel.dispatch_agent_automation("https://example.com","Read title")["status"] == "FAILED"

def test_tinyfish_upstream_failure_is_not_fabricated_success(tmp_path,monkeypatch):
    monkeypatch.setenv("TINYFISH_API_KEY","test-only-not-a-real-key")
    sentinel=TinyFishSentinel(config_path=str(tmp_path/"missing.json"))
    def fail(*args,**kwargs): raise OSError("offline")
    monkeypatch.setattr("urllib.request.urlopen",fail)
    result=sentinel.dispatch_agent_automation("https://example.com","Read title")
    assert result["status"] == "FAILED"
    assert result["result"] is None

