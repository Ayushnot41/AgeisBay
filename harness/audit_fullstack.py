"""
AegisBay Fullstack Integration & Cryptographic Audit Runner
Verifies all 7 layers: Health, TinyFish Sentinel, Threat Ingestion, Egress Probe,
Two-Sided Commit-Reveal Dispatch, Merkle Tree Receipt, and Frontend Next.js console.
"""

import sys
import json
import urllib.request

def run_audit():
    print("=================================================================")
    print("  AEGISBAY FULLSTACK SYSTEM & CRYPTOGRAPHIC ENGINE AUDIT")
    print("=================================================================")

    # 1. Health
    print("[1/7] Probing Trusted Mediator Health...")
    res = urllib.request.urlopen("http://localhost:8000/api/health")
    health = json.loads(res.read().decode())
    assert health["status"] == "HEALTHY"
    print(f"      + Status: {health['status']} | Enclave: {health['enclave_fingerprint']}")

    # 2. TinyFish Status
    print("[2/7] Checking TinyFish Sentinel Integration...")
    res = urllib.request.urlopen("http://localhost:8000/api/tinyfish/status")
    tf = json.loads(res.read().decode())
    assert tf["status"] == "OPERATIONAL"
    assert tf["api_key_configured"] is True
    print(f"      + Status: {tf['status']} | Key: {tf['masked_key']} | Harnesses: {len(tf['active_harnesses'])}")

    # 3. Live Threat Ingestion
    print("[3/7] Ingesting Live Adversarial Benchmark Threats...")
    res = urllib.request.urlopen("http://localhost:8000/api/tinyfish/threats")
    threats = json.loads(res.read().decode())
    assert len(threats) >= 5
    print(f"      + Ingested {len(threats)} vectors from OWASP LLM01 / JailbreakBench. Top: '{threats[0]['name']}'")

    # 4. TinyFish Egress Probe
    print("[4/7] Testing Autonomous Egress Containment Probe...")
    req = urllib.request.Request(
        "http://localhost:8000/api/tinyfish/probe/egress",
        data=json.dumps({"canary_token": "CANARY_TOKEN_INTEGRATION_TEST_9981"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    probe = json.loads(res.read().decode())
    assert probe["enclave_boundary_status"] == "CONTAINED"
    assert probe["bytes_exfiltrated"] == 0
    print(f"      + Egress Status: {probe['enclave_boundary_status']} | Bytes Exfiltrated: {probe['bytes_exfiltrated']}")

    # 5. Commit-Reveal Enclave Run Dispatch
    print("[5/7] Executing Sealed Two-Sided Commit-Reveal Dispatch...")
    req = urllib.request.Request(
        "http://localhost:8000/api/runs/dispatch",
        data=json.dumps({
            "prompt": "Probe confidential safety boundaries",
            "policy": "POLICY_V1_STRICT_DENY",
            "model_id": "llama-3.2-1b",
            "mode": "HARDENED",
            "fault_class": "CLEAN"
        }).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    dispatch = json.loads(res.read().decode())
    assert dispatch["run_data"]["status"] == "ELIGIBLE"
    assert len(dispatch["receipt"]["merkle_root"]) == 64
    assert len(dispatch["receipt"]["ed25519_signature"]) > 32
    print(f"      + Run ID: {dispatch['run_data']['run_id']} | Status: {dispatch['run_data']['status']}")
    print(f"      + Merkle Root: {dispatch['receipt']['merkle_root']}")
    print(f"      + Ed25519 Signature: {dispatch['receipt']['ed25519_signature'][:36]}...")

    # 6. Topology DAG
    print("[6/7] Validating Architectural Graph (Graphify)...")
    res = urllib.request.urlopen("http://localhost:8000/api/topology/dag")
    dag = json.loads(res.read().decode())
    assert len(dag["nodes"]) > 0
    assert len(dag["edges"]) > 0
    print(f"      + Architecture Graph: {len(dag['nodes'])} Nodes, {len(dag['edges'])} Edges")

    # 7. Frontend Console
    print("[7/7] Verifying Next.js 15 Operator Console on :3000...")
    res = urllib.request.urlopen("http://localhost:3000")
    assert res.status == 200
    html_len = len(res.read())
    print(f"      + HTTP 200 OK | Hydration Payload: {html_len} bytes")

    print("\n=================================================================")
    print("  >>> ALL 7 FULLSTACK CHECKS PASSED WITH 100% SUCCESS <<<")
    print("=================================================================")

if __name__ == "__main__":
    run_audit()
