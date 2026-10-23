"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, LockKeyhole, FileCheck2, Radio, Database, Layers, Cpu, ArrowUpRight, Menu, X, LogOut, Play, LoaderCircle, Plus, Smartphone, Laptop, Monitor } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { dispatchRun, getSealLeaderboard, type TelemetryStats, type ModelLeaderboardEntry, type EvaluationRun } from "@/lib/api";
import { ThemeSelect } from "./ThemeProvider";
import { ErrorNotice, Status } from "./WorkbenchUI";
import "../app/landing.css";

interface LandingPageProps {
  onLaunchConsole: () => void;
  onOpenLedger: () => void;
  onOpenAblation: () => void;
  onOpenLeaderboard?: () => void;
  onOpenRedTeam?: () => void;
  onOpenGuard?: () => void;
  onSignIn: () => void;
  stats: TelemetryStats | null;
}

const features = [
  { icon: LockKeyhole, title: "Blinded evaluation", body: "Keep test inputs separate until commitments are frozen. Inspect isolation checks alongside each result." },
  { icon: FileCheck2, title: "Commit before you reveal", body: "Bind the prompt and policy to SHA-256 commitments before the evaluation begins." },
  { icon: Radio, title: "Timing controls", body: "Compare raw and padded release times to inspect the timing side channel." },
  { icon: Cpu, title: "Network sentinel", body: "Explore egress probes and canary checks, then load a selected threat into the evaluation workspace." },
  { icon: Database, title: "An inspectable audit trail", body: "Trace configuration, checks, results, and status through a four-leaf Merkle tree and an Ed25519 signature." },
  { icon: Layers, title: "Evidence-gated scoring", body: "Compare baseline and hardened runs. See which faults make a result ineligible to contribute to the score." },
];

const faqs = [
  { question: "How are the inputs protected from changes?", answer: "AegisBay records the prompt and policy commitments before evaluation. The signed receipt links the committed configuration to the resulting checks and score, so you can inspect what was evaluated." },
  { question: "What happens if a record is changed afterward?", answer: "The evidence ledger recalculates the Merkle root and verifies its signature. A changed record can no longer match its signed receipt and is flagged as tampered." },
  { question: "What do the timing controls demonstrate?", answer: "The paired experiments compare raw and padded release times. The current workers are synthetic, so these results demonstrate the evaluation and audit process rather than measured model security." },
];

function ProtocolIllustration() {
  return (
    <figure className="protocol-figure">
      <div className="protocol-figure-heading"><span>Evaluation protocol</span><span>Illustration</span></div>
      <div className="protocol-drawing" aria-hidden="true">
        <svg viewBox="0 0 460 340" fill="none">
          <path className="protocol-guide" d="M30 240 230 340 430 240M30 190 230 290 430 190M30 140 230 240 430 140M80 75 80 290M230 0 230 340M380 75 380 290" />
          <g className="protocol-layer protocol-layer-evidence">
            <path d="m55 214 175-87 175 87v16l-175 87-175-87z" className="protocol-edge" />
            <path d="m55 214 175-87 175 87-175 87z" className="protocol-plane" />
            <path d="m146 218 84 42 83-42M230 260v22" className="protocol-trace" />
          </g>
          <g className="protocol-layer protocol-layer-seal">
            <path d="m55 148 175-87 175 87v16l-175 87-175-87z" className="protocol-edge" />
            <path d="m55 148 175-87 175 87-175 87z" className="protocol-plane" />
            <path d="m182 149 48-24 48 24-48 24z" className="protocol-chip" />
            <path d="m211 148 14 7 25-14" className="protocol-check" />
          </g>
          <g className="protocol-layer protocol-layer-commit">
            <path d="m55 82 175-70 175 70v16l-175 87L55 98z" className="protocol-edge" />
            <path d="m55 82 175-70 175 70-175 87z" className="protocol-plane" />
            <path d="m141 83 63 31m-40-44 64 31m-39-43 64 31m-39-44 64 31m-40-43 64 31" className="protocol-hashes" />
          </g>
          <path d="M230 169v28m0 37v27" className="protocol-connector" />
          <circle cx="230" cy="197" r="4" className="protocol-point" />
          <circle cx="230" cy="261" r="4" className="protocol-point" />
        </svg>
      </div>
      <figcaption className="protocol-stages">
        <span><span>01</span><strong>Commit</strong></span>
        <span><span>02</span><strong>Seal</strong></span>
        <span><span>03</span><strong>Verify</strong></span>
      </figcaption>
    </figure>
  );
}

export default function LandingPage({
  onLaunchConsole, onOpenLedger, onOpenAblation, onOpenLeaderboard, onOpenRedTeam, onOpenGuard, onSignIn, stats,
}: LandingPageProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [models, setModels] = useState<ModelLeaderboardEntry[]>([]);
  const [sandboxPrompt, setSandboxPrompt] = useState("Verify policy boundaries: inspect prompt injection immunity under blinded isolation.");
  const [sandboxFault, setSandboxFault] = useState("CLEAN");
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<EvaluationRun | null>(null);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  useEffect(() => {
    getSealLeaderboard().then((data) => setModels(data.slice(0, 4))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.getElementById("landing-menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  async function handleSandboxDispatch(event: React.FormEvent) {
    event.preventDefault();
    if (sandboxLoading || !sandboxPrompt.trim()) return;
    setSandboxLoading(true);
    setSandboxResult(null);
    setSandboxError(null);
    try {
      const result = await dispatchRun({
        prompt: sandboxPrompt,
        policy: "POLICY_STRICT_DENY: Enforce adversarial injection boundaries.",
        model_id: "llama-3.2-1b-instruct",
        mode: "HARDENED",
        fault_class: sandboxFault,
        experiment_id: `sandbox_${Date.now()}`,
      });
      setSandboxResult(result.run_data);
    } catch {
      setSandboxError("The evaluation could not be confirmed. Open the evidence ledger before retrying to check whether it completed.");
    } finally {
      setSandboxLoading(false);
    }
  }

  return (
    <div id="home" className="landing-page">
      <a href="#landing-main" className="skip-link">Skip to content</a>
      <header className="landing-header">
        <div className="landing-header-inner">
          <a className="landing-brand" href="#home" aria-label="AegisBay home">
            <span className="aegis-brand-mark">A</span><span>AegisBay</span>
          </a>
          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#features">How it works</a>
            <a href="#sandbox">Try an evaluation</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="landing-header-actions">
            <ThemeSelect />
            {isAuthenticated && user ? (
              <button className="text-action landing-auth" onClick={logout} aria-label="Sign out"><span>{user.name.split(" ")[0]}</span><LogOut size={16} /></button>
            ) : (
              <button className="text-action landing-auth" onClick={onSignIn}>Sign in</button>
            )}
            <button className="button button-primary landing-header-launch" onClick={onLaunchConsole}>Open workspace</button>
            <button id="landing-menu-toggle" className="icon-button landing-menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="landing-mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="landing-mobile-nav" className="landing-mobile-nav" aria-label="Mobile navigation">
            <a href="#features" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#sandbox" onClick={() => setMenuOpen(false)}>Try an evaluation</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            {isAuthenticated ? <button onClick={logout}>Sign out</button> : <button onClick={onSignIn}>Sign in</button>}
            <button onClick={onLaunchConsole}>Open workspace</button>
          </nav>
        )}
      </header>

      <main id="landing-main" tabIndex={-1}>
        <section className="landing-hero landing-container">
          <div className="landing-hero-copy">
            <h1>AI safety testing.<br />Evidence at every step.</h1>
            <p>Freeze the inputs. Run a controlled evaluation. Trace every result back to a signed receipt you can inspect.</p>
            <div className="landing-hero-actions">
              <button className="button button-primary" onClick={onLaunchConsole}>Open workspace <ArrowUpRight size={18} /></button>
              <button className="button" onClick={onOpenLedger}>Explore the evidence</button>
            </div>
            <p className="landing-hero-note"><ShieldCheck size={17} /><span>Synthetic workers. Real cryptographic receipts.</span></p>
          </div>
          <ProtocolIllustration />
        </section>

        <div className="landing-telemetry landing-container" aria-label="Evaluation telemetry">
          <div><span>Recorded evaluations</span><strong>{stats ? stats.total_runs.toLocaleString() : "—"}</strong><small>Committed to the ledger</small></div>
          <div><span>Ledger integrity</span><strong>{stats?.ledger_verification === "VERIFIED" ? "Verified" : stats?.ledger_verification === "EMPTY" ? "No receipts yet" : stats?.ledger_verification === "TAMPER_DETECTED" ? "Tamper detected" : "Awaiting data"}</strong><small>Merkle root verification</small></div>
          <div><span>Timing analysis</span><strong>{stats?.timing_attack_auc != null ? stats.timing_attack_auc.toFixed(2) + " AUC" : "—"}</strong><small>From recorded evaluations</small></div>
          <div><span>Notary key</span><strong className="landing-key">{stats?.enclave_public_key_fingerprint || "Awaiting mediator"}</strong><small>Ed25519 signing fingerprint</small></div>
        </div>

        <section id="features" className="landing-section landing-container">
          <div className="landing-section-heading">
            <h2>A clear path from<br />test to evidence.</h2>
            <p>The same audit trail connects every part of your evaluation. Follow it from frozen inputs to the final signed result.</p>
          </div>
          <div className="landing-features">
            {features.map(({ icon: Icon, title, body }) => (
              <article key={title}><Icon size={22} strokeWidth={1.6} /><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
          <div className="landing-tool-links">
            {onOpenRedTeam && <button className="text-action" onClick={onOpenRedTeam}>Red-team probes <ArrowUpRight size={16} /></button>}
            {onOpenGuard && <button className="text-action" onClick={onOpenGuard}>Policy guard <ArrowUpRight size={16} /></button>}
            <button className="text-action" onClick={onOpenAblation}>Paired experiments <ArrowUpRight size={16} /></button>
          </div>
        </section>

        <section id="sandbox" className="landing-sandbox-section">
          <div className="landing-container landing-sandbox-layout">
            <div className="landing-sandbox-copy">
              <h2>See the audit<br />trail take shape.</h2>
              <p>Send a prompt through a hardened evaluation, then inspect the signed receipt.</p>
              <div className="landing-synthetic-note"><ShieldCheck size={19} /><p>Workers simulate tests and checks. Results demonstrate the audit flow, not model behaviour.</p></div>
            </div>
            <div className="landing-sandbox">
              <form onSubmit={handleSandboxDispatch}>
                <div className="field"><label htmlFor="sandbox-prompt">Evaluation prompt</label><textarea id="sandbox-prompt" rows={4} value={sandboxPrompt} onChange={(event) => setSandboxPrompt(event.target.value)} required /></div>
                <div className="field"><label htmlFor="sandbox-fault">Controlled fault</label><select id="sandbox-fault" value={sandboxFault} onChange={(event) => setSandboxFault(event.target.value)}>
                  <option value="CLEAN">Clean evaluation</option>
                  <option value="FAULT_01_NET_EGRESS">Cross-subnet egress</option>
                  <option value="FAULT_02_PRETEST_PEEK">Pre-test prompt peek</option>
                  <option value="FAULT_03_POLICY_DRIFT">Defense policy drift</option>
                  <option value="FAULT_04_KV_CANARY_BLEED">KV-cache canary bleed</option>
                  <option value="FAULT_05_DEADLINE_OVERRUN">Release deadline overrun</option>
                  <option value="FAULT_06_TELEMETRY_DROP">Missing teardown trace</option>
                </select></div>
                <button className="button button-primary" type="submit" disabled={sandboxLoading || !sandboxPrompt.trim()}>
                  {sandboxLoading ? <LoaderCircle className="spin" size={17} /> : <Play size={17} />}
                  {sandboxLoading ? "Evaluating…" : "Run evaluation"}
                </button>
              </form>
              <ErrorNotice message={sandboxError} />
              {sandboxResult && (
                <div className="landing-sandbox-result" role="status">
                  <div className="row-between"><strong>Evaluation receipt</strong><Status value={sandboxResult.status} /></div>
                  <dl>
                    <div><dt>Run</dt><dd><code>{sandboxResult.run_id}</code></dd></div>
                    <div><dt>Mode</dt><dd>{sandboxResult.mode}</dd></div>
                    <div><dt>Merkle root</dt><dd><code>{sandboxResult.merkle_root}</code></dd></div>
                    <div><dt>Signature</dt><dd><code>{sandboxResult.ed25519_signature}</code></dd></div>
                    <div><dt>Contributed score</dt><dd>{sandboxResult.score_contributed}</dd></div>
                  </dl>
                  <button className="text-action" onClick={onOpenLedger}>Inspect in evidence ledger <ArrowUpRight size={16} /></button>
                </div>
              )}
            </div>
          </div>
        </section>

        {models.length > 0 && (
          <section id="leaderboard" className="landing-section landing-container">
            <div className="landing-section-heading"><div><h2>Model safety rankings.</h2><p>Explore the SEAL evaluation matrix and inspect each model’s attestation.</p></div>
              {onOpenLeaderboard && <button className="button" onClick={onOpenLeaderboard}>View leaderboard <ArrowUpRight size={16} /></button>}
            </div>
            <div className="landing-model-list">
              {models.map((model) => (
                <button key={model.model_id} onClick={onOpenLeaderboard} className="landing-model">
                  <span className="landing-model-rank">{String(model.rank).padStart(2, "0")}</span>
                  <span className="landing-model-name"><strong>{model.name}</strong><small>{model.vendor}</small></span>
                  <span className="landing-model-tier">{model.tier}</span>
                  <span><strong>{model.overall_safety_rating.toFixed(1)}%</strong><small>Safety score</small></span>
                  <span className="landing-model-detail"><strong>{model.jailbreak_resistance.toFixed(1)}%</strong><small>Jailbreak resistance</small></span>
                  <span className="landing-model-detail"><strong>{model.side_channel_timing_auc.toFixed(2)}</strong><small>Timing AUC</small></span>
                  <ArrowUpRight size={18} />
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="landing-devices landing-container">
          <div><h2>The same workspace.<br />Wherever you review.</h2><p>Review receipts on your phone, compare experiments on a laptop, or use the full workspace at your desk.</p></div>
          <div className="landing-device-list">
            <span><Smartphone size={30} strokeWidth={1.5} /><strong>Mobile</strong><small>iOS & Android</small></span>
            <span><Laptop size={36} strokeWidth={1.5} /><strong>Tablet & laptop</strong><small>iPad, Mac & Windows</small></span>
            <span><Monitor size={34} strokeWidth={1.5} /><strong>Desktop</strong><small>Full workspace</small></span>
          </div>
        </section>

        <section id="faq" className="landing-section landing-container landing-faq">
          <h2>A closer look.</h2>
          <div>{faqs.map((faq) => (
            <details key={faq.question}><summary>{faq.question}<Plus size={19} /></summary><p>{faq.answer}</p></details>
          ))}</div>
        </section>
        <section className="landing-final landing-container">
          <h2>Your next evaluation<br />starts here.</h2>
          <div><button className="button button-primary" onClick={onLaunchConsole}>Open workspace <ArrowUpRight size={18} /></button><button className="text-action" onClick={onOpenLedger}>Review the ledger</button></div>
        </section>
      </main>
      <footer className="landing-footer landing-container">
        <a className="landing-brand" href="#home"><span className="aegis-brand-mark">A</span><span>AegisBay</span></a>
        <span>Hack in Hills 2026 · Track 04: Bayora</span>
        <span>Team Awara Coders · Lead: Ayush Sarkar</span>
        <a href="https://github.com/souravsamaddar77-eng/AgeisBay" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a>
      </footer>
    </div>
  );
}
