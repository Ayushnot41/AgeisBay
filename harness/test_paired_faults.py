import os
import pytest
import tempfile
from cryptography.exceptions import InvalidTag

from services.mediator.crypto import (
    canonical_json,
    sha256_hex,
    encrypt_payload_aes_gcm,
    decrypt_payload_aes_gcm,
    build_four_leaf_merkle_receipt,
    verify_merkle_receipt,
    generate_or_load_keys
)
from services.mediator.ledger import LedgerManager
from services.mediator.enclave_runner import EnclaveRunner


@pytest.fixture
def temp_env():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "test_ledger.db")
        chk_path = os.path.join(tmpdir, "test_checkpoint.json")
        key_dir = os.path.join(tmpdir, "keys")
        ledger = LedgerManager(db_path=db_path, checkpoint_path=chk_path)
        runner = EnclaveRunner(ledger=ledger, key_dir=key_dir)
        yield {
            "ledger": ledger,
            "runner": runner,
            "db_path": db_path,
            "chk_path": chk_path,
            "key_dir": key_dir
        }


def test_canonical_json_determinism():
    dict1 = {"b": 2, "a": 1, "c": {"y": 20, "x": 10}}
    dict2 = {"c": {"x": 10, "y": 20}, "a": 1, "b": 2}
    assert canonical_json(dict1) == canonical_json(dict2)
    assert sha256_hex(canonical_json(dict1)) == sha256_hex(canonical_json(dict2))


def test_aes_256_gcm_confidentiality_and_aad():
    run_id = "run_test_aad_001"
    plaintext = "Confidential adversarial red-team payload"
    envelope = encrypt_payload_aes_gcm(plaintext, run_id=run_id)

    # Valid decryption in volatile RAM
    decrypted = decrypt_payload_aes_gcm(
        envelope["ciphertext"],
        envelope["nonce"],
        envelope["key_b64"],
        run_id=run_id
    )
    assert decrypted == plaintext

    # Tampered AAD must fail cryptographic authentication
    with pytest.raises(InvalidTag):
        decrypt_payload_aes_gcm(
            envelope["ciphertext"],
            envelope["nonce"],
            envelope["key_b64"],
            run_id="run_tampered_aad_999"
        )


def test_merkle_receipt_cryptographic_verification(temp_env):
    runner = temp_env["runner"]
    config = {"run_id": "r1", "policy": "deny_injection"}
    checks = {"net_isolation": True, "policy_freeze": True}
    result = {"safety_passed": True, "score": 1.0}
    status = {"status": "ELIGIBLE", "score_contributed": True}

    receipt = build_four_leaf_merkle_receipt(
        config, checks, result, status, runner.private_key
    )

    verification = verify_merkle_receipt(receipt, runner.public_key)
    assert verification["valid"] is True
    assert verification["root_match"] is True
    assert verification["sig_valid"] is True
    assert verification["leaves"]["leaf_01_valid"] is True
    assert verification["leaves"]["leaf_02_valid"] is True
    assert verification["leaves"]["leaf_03_valid"] is True
    assert verification["leaves"]["leaf_04_valid"] is True


@pytest.mark.asyncio
async def test_clean_evaluation_run_is_eligible(temp_env):
    runner = temp_env["runner"]
    res = await runner.execute_run(
        mode="HARDENED",
        fault_class="CLEAN",
        simulate_real_sleep=False
    )
    run_data = res["run_data"]
    checks = res["checks"]

    assert run_data["status"] == "ELIGIBLE"
    assert run_data["score_contributed"] is True
    assert run_data["safety_passed"] is True
    assert all([
        checks["net_isolation_passed"],
        checks["pretest_blinding_passed"],
        checks["policy_freeze_verified"],
        checks["kv_canary_clean"],
        checks["within_release_window"],
        checks["teardown_trace_complete"]
    ])
    assert checks["rejection_reason"] is None


@pytest.mark.asyncio
async def test_fault_01_net_egress_is_invalid(temp_env):
    runner = temp_env["runner"]
    res = await runner.execute_run(
        mode="HARDENED",
        fault_class="FAULT_01_NET_EGRESS",
        simulate_real_sleep=False
    )
    assert res["run_data"]["status"] == "INVALID"
    assert res["run_data"]["score_contributed"] is False
    assert res["checks"]["net_isolation_passed"] is False
    assert "CRITICAL_NET_ISOLATION_VIOLATION" in res["checks"]["rejection_reason"]


@pytest.mark.asyncio
async def test_fault_02_pretest_peek_is_invalid(temp_env):
    runner = temp_env["runner"]
    res = await runner.execute_run(
        mode="HARDENED",
        fault_class="FAULT_02_PRETEST_PEEK",
        simulate_real_sleep=False
    )
    assert res["run_data"]["status"] == "INVALID"
    assert res["run_data"]["score_contributed"] is False
    assert res["checks"]["pretest_blinding_passed"] is False
    assert "PRETEST_BLINDING_BREACH" in res["checks"]["rejection_reason"]


@pytest.mark.asyncio
async def test_fault_03_policy_drift_is_invalid(temp_env):
    runner = temp_env["runner"]
    res = await runner.execute_run(
        mode="HARDENED",
        fault_class="FAULT_03_POLICY_DRIFT",
        simulate_real_sleep=False
    )
    assert res["run_data"]["status"] == "INVALID"
    assert res["run_data"]["score_contributed"] is False
    assert res["checks"]["policy_freeze_verified"] is False
    assert "POLICY_DRIFT_DETECTED" in res["checks"]["rejection_reason"]


@pytest.mark.asyncio
async def test_fault_04_kv_canary_bleed_is_invalid(temp_env):
    runner = temp_env["runner"]
    res = await runner.execute_run(
        mode="HARDENED",
        fault_class="FAULT_04_KV_CANARY_BLEED",
        simulate_real_sleep=False
    )
    assert res["run_data"]["status"] == "INVALID"
    assert res["run_data"]["score_contributed"] is False
    assert res["checks"]["kv_canary_clean"] is False
    assert "KV_CACHE_BLEED" in res["checks"]["rejection_reason"]


@pytest.mark.asyncio
async def test_fault_05_deadline_overrun_is_incomplete(temp_env):
    runner = temp_env["runner"]
    res = await runner.execute_run(
        mode="HARDENED",
        fault_class="FAULT_05_DEADLINE_OVERRUN",
        simulate_real_sleep=False
    )
    assert res["run_data"]["status"] == "INCOMPLETE"
    assert res["run_data"]["score_contributed"] is False
    assert res["checks"]["within_release_window"] is False
    assert "DEADLINE_OVERRUN" in res["checks"]["rejection_reason"]


@pytest.mark.asyncio
async def test_fault_06_telemetry_drop_is_incomplete(temp_env):
    runner = temp_env["runner"]
    res = await runner.execute_run(
        mode="HARDENED",
        fault_class="FAULT_06_TELEMETRY_DROP",
        simulate_real_sleep=False
    )
    assert res["run_data"]["status"] == "INCOMPLETE"
    assert res["run_data"]["score_contributed"] is False
    assert res["checks"]["teardown_trace_complete"] is False
    assert "TELEMETRY_DROP" in res["checks"]["rejection_reason"]


@pytest.mark.asyncio
async def test_paired_ablation_score_contamination(temp_env):
    runner = temp_env["runner"]

    # In Baseline, Fault 02 (pre-test peek) falsely contributes to safety score
    base_res = await runner.execute_run(
        mode="BASELINE",
        fault_class="FAULT_02_PRETEST_PEEK",
        simulate_real_sleep=False
    )
    assert base_res["run_data"]["status"] == "ELIGIBLE"
    assert base_res["run_data"]["score_contributed"] is True

    # In Hardened AegisBay, the fault is rejected from scoring
    hard_res = await runner.execute_run(
        mode="HARDENED",
        fault_class="FAULT_02_PRETEST_PEEK",
        simulate_real_sleep=False
    )
    assert hard_res["run_data"]["status"] == "INVALID"
    assert hard_res["run_data"]["score_contributed"] is False


@pytest.mark.asyncio
async def test_1bit_sqlite_tamper_detection(temp_env):
    runner = temp_env["runner"]
    ledger = temp_env["ledger"]

    # Execute a clean run
    res = await runner.execute_run(mode="HARDENED", fault_class="CLEAN", simulate_real_sleep=False)
    run_id = res["run_data"]["run_id"]

    # Verify run before tamper
    run_before = ledger.get_run_by_id(run_id)
    receipt_before = {
        "leaves": {
            "leaf_01_config": run_before["leaf_01_config"],
            "leaf_02_checks": run_before["leaf_02_checks"],
            "leaf_03_result": run_before["leaf_03_result"],
            "leaf_04_status": run_before["leaf_04_status"]
        },
        "branches": {
            "branch_a": run_before["branch_a"],
            "branch_b": run_before["branch_b"]
        },
        "merkle_root": run_before["merkle_root"],
        "ed25519_signature": run_before["ed25519_signature"],
        "raw_records": run_before["raw_records"]
    }
    verify_before = verify_merkle_receipt(receipt_before, runner.public_key)
    assert verify_before["valid"] is True

    # Mutate 1 bit in SQLite database
    ledger.simulate_tamper(target_run_id=run_id)

    # Re-verify after tamper
    run_after = ledger.get_run_by_id(run_id)
    receipt_after = {
        "leaves": {
            "leaf_01_config": run_after["leaf_01_config"],
            "leaf_02_checks": run_after["leaf_02_checks"],
            "leaf_03_result": run_after["leaf_03_result"],
            "leaf_04_status": run_after["leaf_04_status"]
        },
        "branches": {
            "branch_a": run_after["branch_a"],
            "branch_b": run_after["branch_b"]
        },
        "merkle_root": run_after["merkle_root"],
        "ed25519_signature": run_after["ed25519_signature"],
        "raw_records": run_after["raw_records"]
    }
    verify_after = verify_merkle_receipt(receipt_after, runner.public_key)

    # Result record was tampered -> Leaf 3 recalculation must fail!
    assert verify_after["valid"] is False
    assert verify_after["leaves"]["leaf_03_valid"] is False
    assert verify_after["root_match"] is False

    # Restore authentic state
    ledger.restore_tamper(run_id=run_id)
    run_restored = ledger.get_run_by_id(run_id)
    receipt_restored = {
        "leaves": {
            "leaf_01_config": run_restored["leaf_01_config"],
            "leaf_02_checks": run_restored["leaf_02_checks"],
            "leaf_03_result": run_restored["leaf_03_result"],
            "leaf_04_status": run_restored["leaf_04_status"]
        },
        "branches": {
            "branch_a": run_restored["branch_a"],
            "branch_b": run_restored["branch_b"]
        },
        "merkle_root": run_restored["merkle_root"],
        "ed25519_signature": run_restored["ed25519_signature"],
        "raw_records": run_restored["raw_records"]
    }
    verify_restored = verify_merkle_receipt(receipt_restored, runner.public_key)
    assert verify_restored["valid"] is True
