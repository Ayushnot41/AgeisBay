import os
import json
from typing import Dict, Any, List


def generate_architecture_graph() -> Dict[str, Any]:
    """
    Generate the architectural AST and topological node-edge graph of AegisBay.
    Maps relationships between FastAPI mediator routes, SQLite ledger,
    Ed25519 verifier CLI, Docker air-gapped subnets, and React SecOps components.
    """
    nodes = [
        # Network Subnets & Enclaves
        {
            "id": "subnet_red",
            "label": "Red Subnet",
            "type": "subnet",
            "cidr": "172.28.1.0/24",
            "cluster": "Network Boundaries",
            "status": "Air-Gapped Bridge",
            "description": "Adversary test generator with cap_drop: [ALL] and strict seccomp"
        },
        {
            "id": "subnet_blue",
            "label": "Blue Subnet",
            "type": "subnet",
            "cidr": "172.28.2.0/24",
            "cluster": "Network Boundaries",
            "status": "Air-Gapped Bridge",
            "description": "Defense policy workspace with blinding barrier"
        },
        {
            "id": "subnet_llm",
            "label": "LLM Enclave Subnet",
            "type": "subnet",
            "cidr": "172.28.3.0/24",
            "cluster": "Network Boundaries",
            "status": "Air-Gapped Bridge",
            "description": "Confidential inference worker with post-run KV-cache teardown"
        },
        # Kernel & Infrastructure Enclave
        {
            "id": "seccomp_filter",
            "label": "Seccomp Syscall Filter",
            "type": "enclave",
            "cluster": "Kernel Hardening",
            "status": "SCMP_ACT_ERRNO",
            "description": "Blocks raw sockets, mount, ptrace, bpf, and kexec_load"
        },
        {
            "id": "cgroups_v2",
            "label": "Cgroups v2 Controller",
            "type": "enclave",
            "cluster": "Kernel Hardening",
            "status": "Active (256 PIDs, 1024M)",
            "description": "Enforces deterministic CPU shares, memory caps, and process bounds"
        },
        # Mediator Gateway & Routes
        {
            "id": "mediator_core",
            "label": "Trusted Mediator",
            "type": "mediator",
            "cluster": "Core Services",
            "status": "0.0.0.0:8000",
            "description": "Async FastAPI gateway orchestrating Two-Sided Commit-Reveal"
        },
        {
            "id": "route_dispatch",
            "label": "POST /api/runs/dispatch",
            "type": "route",
            "cluster": "Core Services",
            "status": "FastAPI Async",
            "description": "Receives commitments, encrypts payload (AES-256-GCM), and triggers sealed run"
        },
        {
            "id": "route_telemetry",
            "label": "GET /api/telemetry/stats",
            "type": "route",
            "cluster": "Core Services",
            "status": "FastAPI Async",
            "description": "Streams live p50/p95 latency, AUC (0.502), and validity metrics"
        },
        {
            "id": "route_paired",
            "label": "POST /api/experiments/paired",
            "type": "route",
            "cluster": "Core Services",
            "status": "FastAPI Async",
            "description": "Dispatches paired ablation matrix (Baseline vs. Hardened AegisBay)"
        },
        # Cryptographic Engine
        {
            "id": "crypto_commit_reveal",
            "label": "Two-Sided Commit-Reveal",
            "type": "crypto",
            "cluster": "Cryptographic Engine",
            "status": "RFC 8785 Canonical JSON",
            "description": "Binds SHA-256(prompt || nonce) & SHA-256(policy) before execution"
        },
        {
            "id": "crypto_aes_gcm",
            "label": "AES-256-GCM Envelope",
            "type": "crypto",
            "cluster": "Cryptographic Engine",
            "status": "NIST SP 800-38D",
            "description": "RAM-only decryption with run_id as Additional Authenticated Data (AAD)"
        },
        {
            "id": "crypto_release_shaper",
            "label": "1000ms Latency Shaper",
            "type": "crypto",
            "cluster": "Cryptographic Engine",
            "status": "Constant-Time Gate",
            "description": "Normalizes execution duration to eliminate microarchitectural timing leakage"
        },
        {
            "id": "crypto_merkle_tree",
            "label": "4-Leaf Merkle Tree Builder",
            "type": "crypto",
            "cluster": "Cryptographic Engine",
            "status": "Deterministic SHA-256",
            "description": "Hashes Config, Checks, Result, and Status into tamper-evident branches"
        },
        {
            "id": "crypto_ed25519",
            "label": "Ed25519 Signature Attestation",
            "type": "crypto",
            "cluster": "Cryptographic Engine",
            "status": "Asymmetric PKCS8",
            "description": "Enclave signs Merkle root; verifiable by independent third parties"
        },
        # Storage & Persistence
        {
            "id": "db_sqlite_ledger",
            "label": "SQLite Immutable Ledger",
            "type": "table",
            "cluster": "Audit & Verification",
            "status": "data/aegisbay_ledger.db",
            "description": "Stores run manifests, 6 boundary check traces, and cryptographic receipts"
        },
        {
            "id": "checkpoint_json",
            "label": "Signed Checkpoint Export",
            "type": "table",
            "cluster": "Audit & Verification",
            "status": "data/latest_checkpoint.json",
            "description": "Self-contained JSON artifact for standalone offline verifier"
        },
        # Verifier & Test Harness
        {
            "id": "cli_verifier",
            "label": "Ed25519 Verifier CLI",
            "type": "cli",
            "cluster": "Audit & Verification",
            "status": "services.verifier.verify_cli",
            "description": "Independent tool re-evaluating SHA-256 leaf paths and Ed25519 signatures"
        },
        {
            "id": "harness_paired_faults",
            "label": "Paired Fault Runner",
            "type": "cli",
            "cluster": "Audit & Verification",
            "status": "harness/run_paired_experiments.py",
            "description": "Executes 6 controlled fault classes in dual Baseline and Hardened modes"
        },
        # React Next.js Console
        {
            "id": "ui_telemetry_ribbon",
            "label": "Top Telemetry Ribbon",
            "type": "component",
            "cluster": "SecOps Frontend",
            "status": "Next.js 15 Client",
            "description": "Real-time KPIs: Ed25519 PK, p50/p95 latency, AUC (0.502), Ledger sync"
        },
        {
            "id": "ui_topology_dag",
            "label": "Enclave Topology DAG",
            "type": "component",
            "cluster": "SecOps Frontend",
            "status": "Interactive SVG / Framer Motion",
            "description": "Visualizes live cross-subnet packet flow and boundary isolation"
        },
        {
            "id": "ui_commit_reveal",
            "label": "Commit-Reveal Dispatcher",
            "type": "component",
            "cluster": "SecOps Frontend",
            "status": "Next.js 15 Client",
            "description": "Operator dispatch panel with AES-256-GCM encryption and 1000ms release bar"
        },
        {
            "id": "ui_paired_matrix",
            "label": "Paired Fault Comparator",
            "type": "component",
            "cluster": "SecOps Frontend",
            "status": "Recharts + Tabular Grid",
            "description": "Baseline vs. Hardened ablation matrix proving zero safety score contamination"
        },
        {
            "id": "ui_merkle_inspector",
            "label": "4-Leaf Merkle Tree Visualizer",
            "type": "component",
            "cluster": "SecOps Frontend",
            "status": "Framer Motion Tree + 1-Bit Tamper",
            "description": "Inspects Leaves 1-4, Branch A/B, Ed25519 signature, and interactive tamper alert"
        }
    ]

    edges = [
        # Red Subnet flow
        {"source": "subnet_red", "target": "mediator_core", "label": "Encrypted Attack Envelope", "protocol": "AES-256-GCM (AAD: run_id)"},
        {"source": "subnet_blue", "target": "mediator_core", "label": "Frozen Defense Policy Hash", "protocol": "SHA-256 Digest"},
        {"source": "mediator_core", "target": "subnet_llm", "label": "Isolated Plaintext Invocation", "protocol": "RAM-Only Context"},

        # Enclave enforcement
        {"source": "seccomp_filter", "target": "subnet_red", "label": "Syscall Interception", "protocol": "SCMP_ACT_ERRNO"},
        {"source": "seccomp_filter", "target": "subnet_blue", "label": "Syscall Interception", "protocol": "SCMP_ACT_ERRNO"},
        {"source": "seccomp_filter", "target": "subnet_llm", "label": "Syscall Interception", "protocol": "SCMP_ACT_ERRNO"},
        {"source": "cgroups_v2", "target": "mediator_core", "label": "Resource Limits", "protocol": "Linux Cgroups v2"},

        # Core Mediator pipeline
        {"source": "route_dispatch", "target": "crypto_commit_reveal", "label": "Binds Commitments", "protocol": "Two-Sided Freeze"},
        {"source": "crypto_commit_reveal", "target": "crypto_aes_gcm", "label": "Envelope Decryption", "protocol": "Volatile RAM"},
        {"source": "crypto_aes_gcm", "target": "crypto_release_shaper", "label": "Timing Normalization", "protocol": "1000ms Constant-Time"},
        {"source": "crypto_release_shaper", "target": "crypto_merkle_tree", "label": "Builds 4 Leaves", "protocol": "Canonical JSON SHA-256"},
        {"source": "crypto_merkle_tree", "target": "crypto_ed25519", "label": "Signs Merkle Root", "protocol": "Ed25519 Curve25519"},

        # Persistence & Verification
        {"source": "crypto_ed25519", "target": "db_sqlite_ledger", "label": "Commits Run & Receipt", "protocol": "SQLite Row Insertion"},
        {"source": "db_sqlite_ledger", "target": "checkpoint_json", "label": "Exports Snapshot", "protocol": "JSON Checkpoint"},
        {"source": "checkpoint_json", "target": "cli_verifier", "label": "Recomputes Proofs", "protocol": "Offline Verification"},
        {"source": "harness_paired_faults", "target": "route_paired", "label": "Triggers 6 Fault Classes", "protocol": "HTTP REST POST"},

        # UI Data Flow
        {"source": "route_telemetry", "target": "ui_telemetry_ribbon", "label": "Live KPIs & Latency", "protocol": "Polling / SSE"},
        {"source": "mediator_core", "target": "ui_topology_dag", "label": "Live Packet Events", "protocol": "SSE Topology Stream"},
        {"source": "ui_commit_reveal", "target": "route_dispatch", "label": "Operator Dispatch Action", "protocol": "REST Dispatch"},
        {"source": "db_sqlite_ledger", "target": "ui_paired_matrix", "label": "Ablation Query", "protocol": "REST Query"},
        {"source": "db_sqlite_ledger", "target": "ui_merkle_inspector", "label": "Receipt Tree Data", "protocol": "REST Receipt Query"}
    ]

    return {
        "project": "AEGISBAY",
        "version": "2026.10-production",
        "description": "Architectural graph mapping FastAPI mediator routes, SQLite ledger, Ed25519 verifier CLI, Docker subnets, and React components.",
        "nodes": nodes,
        "edges": edges
    }


def write_graphify_output(output_dir: str = "graphify-out") -> str:
    """Write graph data to graphify-out/graph.json."""
    os.makedirs(output_dir, exist_ok=True)
    graph_data = generate_architecture_graph()
    output_path = os.path.join(output_dir, "graph.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(graph_data, f, indent=2)
    return output_path


if __name__ == "__main__":
    path = write_graphify_output()
    print(f"Graphify architecture successfully exported to {path}")
