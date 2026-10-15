import os
import sys
import json
import argparse
from typing import Dict, Any, List

from cryptography.hazmat.primitives import serialization
from services.mediator.crypto import verify_merkle_receipt


def load_public_key(pub_key_path: str = "data/keys/public_key.pem"):
    if not os.path.exists(pub_key_path):
        raise FileNotFoundError(f"Enclave public key not found at {pub_key_path}")
    with open(pub_key_path, "rb") as f:
        return serialization.load_pem_public_key(f.read())


def verify_checkpoint(checkpoint_path: str, pub_key_path: str = "data/keys/public_key.pem") -> int:
    if not os.path.exists(checkpoint_path):
        print(f"[ERROR] Checkpoint file not found: {checkpoint_path}")
        return 1

    with open(checkpoint_path, "r", encoding="utf-8") as f:
        checkpoint = json.load(f)

    public_key = load_public_key(pub_key_path)
    runs = checkpoint.get("runs", [])

    print("=" * 115)
    print("  AEGISBAY OFFLINE CRYPTOGRAPHIC AUDIT VERIFIER (VERSION 2026.10-PRODUCTION)")
    print("  Evidence-Gated AI Safety Testing & Blinded Zero-Trust Evaluation Enclave")
    print("=" * 115)
    print(f"  Target Checkpoint: {checkpoint_path}")
    print(f"  Exported At:       {checkpoint.get('exported_at', 'UNKNOWN')}")
    print(f"  Total Runs:        {len(runs)}")
    print("-" * 115)
    print(f"  {'RUN ID':<18} | {'MODE':<8} | {'FAULT CLASS':<26} | {'STATUS':<10} | {'MERKLE ROOT':<12} | {'ED25519':<9} | {'AUDIT OUTCOME'}")
    print("-" * 115)

    all_passed = True
    passed_count = 0
    tampered_count = 0
    tampered_details: List[Dict[str, Any]] = []

    for run in runs:
        run_id = run["run_id"]
        mode = run["mode"]
        fault_class = run["fault_class"]
        status = run["status"]

        receipt = {
            "leaves": {
                "leaf_01_config": run["leaf_01_config"],
                "leaf_02_checks": run["leaf_02_checks"],
                "leaf_03_result": run["leaf_03_result"],
                "leaf_04_status": run["leaf_04_status"]
            },
            "branches": {
                "branch_a": run["branch_a"],
                "branch_b": run["branch_b"]
            },
            "merkle_root": run["merkle_root"],
            "ed25519_signature": run["ed25519_signature"],
            "raw_records": run.get("raw_records", {})
        }

        verification = verify_merkle_receipt(receipt, public_key)

        root_ok = "PASS" if verification["root_match"] else "FAIL"
        sig_ok = "PASS" if verification["sig_valid"] else "FAIL"

        if verification["valid"] and not run.get("is_tampered", False):
            outcome = "[VERIFIED AUTHENTIC]"
            passed_count += 1
        else:
            outcome = "[TAMPER DETECTED]"
            all_passed = False
            tampered_count += 1
            tampered_details.append({
                "run_id": run_id,
                "verification": verification,
                "stored_root": run["merkle_root"],
                "recomputed_root": verification["recomputed_root"]
            })

        print(f"  {run_id:<18} | {mode:<8} | {fault_class:<26} | {status:<10} | {root_ok:<12} | {sig_ok:<9} | {outcome}")

    print("-" * 115)
    print(f"  AUDIT SUMMARY: {passed_count} Verified Authentic | {tampered_count} Tampered / Corrupted")
    print("=" * 115)

    if tampered_details:
        print("\n[!] CRYPTOGRAPHIC INTEGRITY VIOLATION DIAGNOSTIC REPORT:")
        for item in tampered_details:
            v = item["verification"]
            r_id = item["run_id"]
            print(f"  - Target Run ID: {r_id}")
            print(f"    Stored Root:     {item['stored_root']}")
            print(f"    Recomputed Root: {item['recomputed_root']}")
            leaves = v["leaves"]
            print(f"    Leaf 1 (Config): {'MATCH' if leaves['leaf_01_valid'] else 'MISMATCH'}")
            print(f"    Leaf 2 (Checks): {'MATCH' if leaves['leaf_02_valid'] else 'MISMATCH'}")
            print(f"    Leaf 3 (Result): {'MATCH' if leaves['leaf_03_valid'] else 'CORRUPTED / TAMPERED'}")
            print(f"    Leaf 4 (Status): {'MATCH' if leaves['leaf_04_valid'] else 'MISMATCH'}")
            print(f"    Branch A:        {'MATCH' if v['branches']['branch_a_valid'] else 'BROKEN'}")
            print(f"    Branch B:        {'MATCH' if v['branches']['branch_b_valid'] else 'BROKEN'}")
            print(f"    Ed25519 Sig:     {'VALID' if v['sig_valid'] else 'INVALID'}\n")
        return 1

    print("\n[+] Cryptographic Proof Complete: All 4 Merkle leaves, branch pairs, root hashes, and Ed25519 signatures verified.")
    return 0


def main():
    parser = argparse.ArgumentParser(description="AegisBay Offline Cryptographic Audit Verifier")
    parser.add_argument("--checkpoint", default="data/latest_checkpoint.json", help="Path to exported checkpoint JSON")
    parser.add_argument("--key", default="data/keys/public_key.pem", help="Path to enclave Ed25519 public key")
    args = parser.parse_args()

    exit_code = verify_checkpoint(args.checkpoint, args.key)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
