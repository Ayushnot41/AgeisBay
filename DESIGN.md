# DESIGN SPECIFICATION: AEGISBAY SECOPS CONSOLE
**Version:** 2026.10-production  
**Design System Identity:** Industrial SecOps Telemetry & Cryptographic Verification Workbench  
**Target Ergonomics:** Sub-millisecond state transitions, deterministic audit paths, zero-slop information density.

---

## 1. Color Palette & Token Architecture

The color system enforces strict WCAG AAA contrast ratios against an obsidian root canvas. All saturation levels are calibrated to prevent eye fatigue during prolonged red/blue team evaluation runs while drawing immediate visual hierarchy to cryptographic validity states.

| Token Name | Hex Code | Purpose / Application |
|---|---|---|
| `--color-canvas-obsidian` | `#07090E` | Root application background and air-gap gutters |
| `--color-panel-recessed` | `#0D111A` | Telemetry wells, data grids, and sunken inspector panels |
| `--color-card-elevated` | `#151C28` | Elevated interaction cards, control drawers, modal frames |
| `--color-border-hairline` | `#1E293B` | 1px structural hairline borders and grid column rules |
| `--color-border-focus` | `#334155` | Focused input boundary and active tab indicators |
| `--color-status-pass` | `#10B981` | ELIGIBLE status, verified Ed25519 root, clean canary |
| `--color-status-fail` | `#EF4444` | INVALID status, Merkle leaf mismatch, unauthorized egress |
| `--color-status-warn` | `#F59E0B` | INCOMPLETE status, timing deadline overrun, dropped trace |
| `--color-crypto-cyan` | `#06B6D4` | SHA-256 Merkle hashes, Ed25519 public keys, AAD tokens |
| `--color-enclave-blue` | `#3B82F6` | Mediator gateway routes, isolated subnet interfaces |
| `--color-text-primary` | `#F8FAFC` | Critical metrics, verified status headings, active values |
| `--color-text-secondary` | `#94A3B8` | Column labels, invariant descriptions, protocol names |
| `--color-text-muted` | `#64748B` | Timestamp offsets, hex offsets, secondary metadata |

---

## 2. Typography & Numerical Precision

To prevent layout jitter during live telemetry updates and high-frequency dispatch cycles, all numbers, hashes, and network identifiers strictly enforce monospaced tabular numerals.

- **Primary UI Typeface:** `Inter`, `-apple-system`, `sans-serif` (system font stack, 400/500/600 weight)
- **Monospace & Cryptographic Typeface:** `JetBrains Mono`, `ui-monospace`, `monospace`
- **Tabular Numerals Rule:**
  ```css
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.025em;
  ```
- **Hierarchy Scale:**
  - `Display / KPI`: 24px / line-height 28px / font-weight 700 / tabular-nums
  - `Panel Header`: 14px / line-height 18px / font-weight 600 / uppercase / tracking 0.05em
  - `Data Metric`: 13px / line-height 16px / font-weight 500 / tabular-nums
  - `Code / Hash`: 12px / line-height 16px / font-weight 400 / tabular-nums
  - `Micro Tag`: 10px / line-height 12px / font-weight 600 / uppercase / tracking 0.08em

---

## 3. Spatial Depth & 21st.dev Elevation Rules

Hardware-like tactile elevation is achieved using layered box-shadows, inset telemetry wells, and 1px specular top highlights.

### Recessed Telemetry Well (Sunken)
Applied to real-time packet monitors, Merkle leaf inspector drawers, and log streams:
```css
background: #0D111A;
border: 1px solid #1E293B;
box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(0, 0, 0, 0.2);
```

### Elevated Operator Card (Surfaced)
Applied to dispatch control panels, paired experiment cards, and active run summary:
```css
background: #151C28;
border: 1px solid #1E293B;
box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
```

### Specular Top Highlight
All elevated header bars and active modals feature a subtle 1px white specular border on the top edge to simulate machined physical chassis edges:
```css
border-top: 1px solid rgba(255, 255, 255, 0.08);
```

---

## 4. Four-Panel Operator Workspace Grid

The AegisBay SecOps interface is structured as a non-scrollable, high-density 4-panel workbench engineered for split-second red/blue evaluation decisions.

```
+----------------------------------------------------------------------------------------------------+
| TOP TELEMETRY RIBBON: Ed25519 PK | Seccomp/Cgroups | Runs (Elig/Inv/Inc) | p50/p95 | AUC | Ledger Sync |
+--------------------------------------------------+-------------------------------------------------+
| PANEL A: Enclave Topology & Boundary Monitor     | PANEL B: Two-Sided Commit-Reveal Dispatcher     |
| - 3 Air-gapped subnets (Red/Blue/LLM)            | - Step 1: Commitment & Policy Hash Freeze       |
| - Live packet flow & seccomp boundary status     | - Step 2: AES-256-GCM Envelope Encryption (AAD) |
| - Rootless container cgroup v2 pressure          | - Step 3: Constant-Time 1000ms Release Gate     |
+--------------------------------------------------+-------------------------------------------------+
| PANEL C: Paired Fault Experiment Comparator      | PANEL D: 4-Leaf Merkle Receipt & Verifier       |
| - 6 Controlled Fault Classes (Clean to Drop)     | - Leaf 1 (Config), Leaf 2 (Checks) -> Branch A  |
| - Baseline vs. Hardened AegisBay Ablation Matrix | - Leaf 3 (Result), Leaf 4 (Status) -> Branch B  |
| - Score contamination vs. Gated Safety Metric    | - Merkle Root -> Ed25519 Signature Verification |
| - Real-time paired dispatch trigger              | - 1-Click "Simulate 1-Bit SQLite Tamper" Check  |
+--------------------------------------------------+-------------------------------------------------+
```

---

## 5. Interaction & Motion Physics (Framer Motion Specs)

All UI transitions follow deterministic, non-sluggish physical spring constants:
- **Spring Stiffness:** `380`
- **Spring Damping:** `30`
- **Mass:** `0.8`
- **Constant-Time 1000ms Progress Bar:** Linear transition timed with `duration: 1.0, ease: "linear"` matching the server-side bounded latency window.
- **Merkle Leaf Verification Wave:** Staggered 40ms pulse propagating from Leaf 1-4 through Branch A/B to the Root.
- **Tamper Alert State:** Instant crimson flash (`#EF4444`) on the affected leaf node and invalid root signature with zero layout shift.

---

## 6. Strict Anti-AI-Slop Directives

1. **Strict Ban on Emojis:** Strictly zero emojis across all UI elements, status badges, notifications, terminal outputs, and docs. Use 1.5px stroke Lucide SVG icons or 6px geometric LED dots.
2. **Zero Hardcoded Mock Arrays:** Every single data point in the UI must originate from the live FastAPI `/api/...` endpoints and SQLite audit ledger.
3. **No Marketing Hero:** The root path `/` renders the high-density SecOps console immediately.
4. **Deterministic Cryptographic Verification:** All visual Merkle proof branches must execute real SHA-256 recalculation against live database row states.
