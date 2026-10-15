<div align="center">

```
   █████╗ ███████╗ ██████╗ ██╗███████╗██████╗  █████╗ ██╗   ██╗
  ██╔══██╗██╔════╝██╔════╝ ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝
  ███████║█████╗  ██║  ███╗██║███████╗██████╔╝███████║ ╚████╔╝ 
  ██╔══██║██╔══╝  ██║   ██║██║╚════██║██╔══██╗██╔══██║  ╚██╔╝  
  ██║  ██║███████╗╚██████╔╝██║███████║██████╔╝██║  ██║   ██║   
  ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   
```

### Evidence-Gated AI Safety Testing & Blinded Zero-Trust Evaluation Enclave
**Hack in Hills '26 — Track 04: Securing Adversarial AI Safety Testing Infrastructure (Bayora)**  
**Team Awara Coders** | Lead: **Ayush Sarkar** (B.Tech CSE AI & ML, Brainware University)

<br/>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 240" width="100%" height="240" style="background:#07090E; border:1px solid #1E293B; border-radius:8px;">
  <defs>
    <linearGradient id="cyberCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="emeraldPass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#059669" stop-opacity="0.4"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Grid wireframe background -->
  <g stroke="#151C28" stroke-width="1" opacity="0.6">
    <line x1="0" y1="40" x2="1000" y2="40"/>
    <line x1="0" y1="80" x2="1000" y2="80"/>
    <line x1="0" y1="120" x2="1000" y2="120"/>
    <line x1="0" y1="160" x2="1000" y2="160"/>
    <line x1="0" y1="200" x2="1000" y2="200"/>
    <line x1="100" y1="0" x2="100" y2="240"/>
    <line x1="250" y1="0" x2="250" y2="240"/>
    <line x1="400" y1="0" x2="400" y2="240"/>
    <line x1="550" y1="0" x2="550" y2="240"/>
    <line x1="700" y1="0" x2="700" y2="240"/>
    <line x1="850" y1="0" x2="850" y2="240"/>
  </g>

  <!-- Node 1: Red Workspace (Adversary) -->
  <g transform="translate(60, 70)">
    <polygon points="60,0 120,30 120,90 60,120 0,90 0,30" fill="#0D111A" stroke="#EF4444" stroke-width="1.5"/>
    <polygon points="60,0 120,30 60,60 0,30" fill="#151C28" stroke="#EF4444" stroke-width="0.8"/>
    <text x="60" y="70" font-family="monospace" font-size="11" fill="#F8FAFC" text-anchor="middle" font-weight="600">RED SUBNET</text>
    <text x="60" y="86" font-family="monospace" font-size="9" fill="#94A3B8" text-anchor="middle">172.28.1.0/24</text>
    <circle cx="60" cy="40" r="4" fill="#EF4444"/>
  </g>

  <!-- Directed Enclave Vector 1 -->
  <path d="M 190 125 L 340 125" stroke="#06B6D4" stroke-width="1.5" stroke-dasharray="4 4"/>
  <polygon points="340,125 330,120 330,130" fill="#06B6D4"/>
  <text x="265" y="115" font-family="monospace" font-size="9" fill="#06B6D4" text-anchor="middle">AES-256-GCM + AAD</text>

  <!-- Node 2: Trusted Mediator (Zero-Trust Enclave) -->
  <g transform="translate(360, 40)">
    <rect x="0" y="0" width="260" height="150" rx="8" fill="#0D111A" stroke="#3B82F6" stroke-width="1.5" filter="url(#glow)"/>
    <rect x="0" y="0" width="260" height="28" rx="8" fill="#151C28" stroke="#1E293B" stroke-width="1"/>
    <text x="130" y="18" font-family="monospace" font-size="11" fill="#F8FAFC" text-anchor="middle" font-weight="700">TRUSTED MEDIATOR ENCLAVE</text>
    <text x="130" y="52" font-family="monospace" font-size="10" fill="#06B6D4" text-anchor="middle">TWO-SIDED COMMIT-REVEAL</text>
    <text x="130" y="75" font-family="monospace" font-size="9" fill="#94A3B8" text-anchor="middle">RAM Envelope Decryption</text>
    <text x="130" y="95" font-family="monospace" font-size="9" fill="#94A3B8" text-anchor="middle">1000ms Constant-Time Release Window</text>
    <text x="130" y="115" font-family="monospace" font-size="9" fill="#10B981" text-anchor="middle">cgroups v2 + Seccomp Enforced</text>
    <circle cx="20" cy="14" r="4" fill="#10B981"/>
    <circle cx="34" cy="14" r="4" fill="#06B6D4"/>
  </g>

  <!-- Directed Enclave Vector 2 -->
  <path d="M 630 125 L 770 125" stroke="#10B981" stroke-width="1.5"/>
  <polygon points="770,125 760,120 760,130" fill="#10B981"/>
  <text x="700" y="115" font-family="monospace" font-size="9" fill="#10B981" text-anchor="middle">Ed25519 Signed Root</text>

  <!-- Node 3: 4-Leaf Merkle Provenance Ledger -->
  <g transform="translate(790, 55)">
    <rect x="0" y="0" width="160" height="120" rx="6" fill="#0D111A" stroke="#10B981" stroke-width="1.5"/>
    <text x="80" y="24" font-family="monospace" font-size="10" fill="#F8FAFC" text-anchor="middle" font-weight="700">4-LEAF MERKLE</text>
    <text x="80" y="44" font-family="monospace" font-size="8.5" fill="#94A3B8" text-anchor="middle">L1: Config | L2: Checks</text>
    <text x="80" y="60" font-family="monospace" font-size="8.5" fill="#94A3B8" text-anchor="middle">L3: Result | L4: Status</text>
    <line x1="20" y1="72" x2="140" y2="72" stroke="#1E293B" stroke-width="1"/>
    <text x="80" y="90" font-family="monospace" font-size="8.5" fill="#06B6D4" text-anchor="middle">Branch A + Branch B</text>
    <text x="80" y="106" font-family="monospace" font-size="9" fill="#10B981" text-anchor="middle" font-weight="600">Tamper-Evident Proof</text>
  </g>
</svg>

</div>

---

## Executive Architectural Summary

Current adversarial AI safety benchmarks evaluate model defenses on insecure, shared infrastructure where model providers (Blue Teams) can observe live attack prompts, leak KV-cache state across test sessions, tune defensive filters mid-evaluation, or infer test semantics via microarchitectural timing side-channels.

**AegisBay** is an Evidence-Gated AI Safety Testing and Blinded Zero-Trust Evaluation Enclave that deterministically isolates attack generation, defense policy verification, and LLM inference across air-gapped container subnets. Every evaluation run is bound by a **Two-Sided Commit-Reveal protocol**, sealed behind **AES-256-GCM envelope encryption**, normalized through a **1000ms constant-time release window**, and committed to an immutable **4-Leaf Merkle Provenance Tree with Ed25519 cryptographic signatures**.

If any isolation boundary, timing deadline, or policy digest is violated, the run is flagged as `INVALID` or `INCOMPLETE`, rejecting it from contaminating safety benchmark scores while preserving an unforgeable cryptographic audit receipt.

---

## Core Security Invariants

### 1. Two-Sided Commit-Reveal Protocol
1. **Commit Phase (Pre-Run Freeze):** Both the Red attacker and Blue defender register deterministic cryptographic commitments before test execution starts:
   - `attack_commitment = SHA-256(prompt || red_nonce)`
   - `defense_artifact_hash = SHA-256(declarative_defense_policy)`
   - `model_digest = SHA-256(weights_manifest || runtime_config)`
2. **Confidential Transport:** Prompts are transmitted to the Trusted Mediator using AES-256-GCM with the `run_id` as Additional Authenticated Data (AAD). The Blue workspace never receives prompt plaintext or live execution traces.
3. **RAM-Only Decryption & Isolated Invocation:** Plaintext exists only in volatile RAM inside the sealed Mediator enclave during LLM inference.
4. **Post-Run State Sanitization:** Fresh execution context per run with mandatory post-run KV-cache canary flush and worker teardown attestation.

### 2. Evidence-Gated Scoring State Machine
Evaluation scores are strictly evidence-gated:
- **`ELIGIBLE` (`score_contributed = 1`):** All 6 boundary, policy, timing, and teardown invariants hold. The run contributes to model safety metrics.
- **`INVALID` (`score_contributed = 0`):** Integrity or blinding failure detected. The run is excluded from safety metrics and stored in the signed ledger.
- **`INCOMPLETE` (`score_contributed = 0`):** Timing window deadline overrun or missing teardown trace. The run is withheld from safety metrics and stored in the signed ledger.

### 3. Four-Leaf Merkle Receipt Schema
Every completed evaluation run generates a deterministic 4-leaf cryptographic receipt:
```
               [ Merkle Root ]  --> Ed25519 Signed by Enclave Key
                     /     \
                    /       \
          [ Branch A ]     [ Branch B ]
            /     \           /     \
           /       \         /       \
      [ Leaf 1 ] [ Leaf 2 ] [ Leaf 3 ] [ Leaf 4 ]
       Config     Checks     Result     Status
```
- **Leaf 1 (Config):** `SHA256("leaf:config:" + canonical_json(config_manifest))`
- **Leaf 2 (Checks):** `SHA256("leaf:checks:" + canonical_json(checks_record))`
- **Leaf 3 (Result):** `SHA256("leaf:result:" + canonical_json(result_record))`
- **Leaf 4 (Status):** `SHA256("leaf:status:" + canonical_json(status_record))`
- **Branch A:** `SHA256("branch:A:" + Leaf_01 + ":" + Leaf_02)`
- **Branch B:** `SHA256("branch:B:" + Leaf_03 + ":" + Leaf_04)`
- **Merkle Root:** `SHA256("root:" + Branch_A + ":" + Branch_B)`
- **Attestation:** `Base64(Ed25519_Sign(private_key, merkle_root))`

---

## The Six Controlled Fault Classes

AegisBay subjects the evaluation harness to six controlled fault injections contrasting a vulnerable baseline with the hardened enclave:

| Fault ID | Class Identifier | Invariant Tested | Hardened Outcome | Score Impact |
|---|---|---|---|---|
| `CLEAN` | Clean Evaluation | All boundaries, digests, and timing within spec | `ELIGIBLE` | Contributes (1.0) |
| `FAULT_01` | `FAULT_01_NET_EGRESS` | Unauthorized cross-subnet probing (Red -> Blue 172.28.2.0/24) | `INVALID` | Discarded (0.0) |
| `FAULT_02` | `FAULT_02_PRETEST_PEEK` | Blue attempts to inspect prompt plaintext prior to run closure | `INVALID` | Discarded (0.0) |
| `FAULT_03` | `FAULT_03_POLICY_DRIFT` | Blue defense policy digest changes dynamically mid-run | `INVALID` | Discarded (0.0) |
| `FAULT_04` | `FAULT_04_KV_CANARY_BLEED` | Prior session canary token discovered in LLM worker context | `INVALID` | Discarded (0.0) |
| `FAULT_05` | `FAULT_05_DEADLINE_OVERRUN` | Worker latency exceeds calibrated 1000ms release window | `INCOMPLETE` | Discarded (0.0) |
| `FAULT_06` | `FAULT_06_TELEMETRY_DROP` | Worker omits signed context-teardown attestation trace | `INCOMPLETE` | Discarded (0.0) |

---

## Repository Structure

```
AgeisBay/
├── DESIGN.md                     # Stitch MCP design DNA, elevation tokens, grid specs
├── Makefile                      # CLI automation (up, audit, verify, test, graph)
├── docker-compose.yml            # 3 air-gapped bridge subnets with rootless security
├── infra/
│   └── seccomp-enclave.json      # Syscall filter (blocks raw sockets, ptrace, mount)
├── services/
│   ├── mediator/                 # FastAPI async gateway, commit-reveal, AES-256-GCM
│   │   ├── app.py                # REST endpoints, SSE streams, middleware
│   │   ├── crypto.py             # AES-256-GCM, Merkle 4-leaf tree, Ed25519 engine
│   │   ├── ledger.py             # SQLite persistence, checkpoint exporter, tamper test
│   │   └── enclave_runner.py     # Latency shaper (1000ms), isolated synthetic worker
│   └── verifier/
│       └── verify_cli.py         # Standalone offline Ed25519 & Merkle audit CLI
├── harness/
│   ├── run_paired_experiments.py # Dual-mode test runner (Baseline vs. Hardened)
│   └── test_paired_faults.py     # Pytest verification suite (100% pass)
├── graphify-out/
│   └── graph.json                # Architectural AST graph & node-edge DAG
└── web/                          # Next.js 15 + React 19 + Tailwind + Framer Motion
    ├── app/                      # Dense SecOps & Validity Gate Workbench
    ├── components/               # 4-panel operator interface components
    └── lib/                      # Live API client & Merkle DAG helpers
```

---

## Quickstart & Verification

### 1. Run Automated Test Suite
```bash
pytest -v harness/test_paired_faults.py
```

### 2. Run Paired Fault Experiments
```bash
python harness/run_paired_experiments.py
```

### 3. Verify Cryptographic Provenance Ledger (Offline)
```bash
python -m services.verifier.verify_cli --checkpoint data/latest_checkpoint.json
```

### 4. Launch Operator SecOps Console
```bash
# Terminal 1: Trusted Mediator Backend
python -m services.mediator.app

# Terminal 2: Next.js Frontend Console
cd web && npm run dev
```

---

## Cryptographic Guarantees & Anti-Slop Principles
- **Strictly Zero Emojis:** All UI components and CLI logs use crisp geometric indicators and SVG icons.
- **Strictly Zero Mock Arrays:** All telemetry, p50/p95 latency metrics, and Merkle leaf hashes reflect active database state.
- **Tabular Numerals:** Strict monospaced alignment for timestamps, execution latencies, and SHA-256 digests.
- **Deterministic Offline Verification:** Third-party auditors can recompute every Merkle branch and verify Ed25519 signatures completely independent of the running server.
