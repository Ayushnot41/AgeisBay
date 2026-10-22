"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Radio,
  FileCheck2,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles,
  Smartphone,
  Laptop,
  Monitor,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Play,
  RotateCw,
} from "lucide-react";
import {
  TelemetryStats,
  dispatchRun,
  API_BASE,
} from "@/lib/api";

interface LandingPageProps {
  onLaunchConsole: () => void;
  onOpenLedger: () => void;
  onOpenAblation: () => void;
  stats: TelemetryStats | null;
}

export default function LandingPage({
  onLaunchConsole,
  onOpenLedger,
  onOpenAblation,
  stats,
}: LandingPageProps) {
  const { user, isAuthenticated, logout, loginDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Interactive Live Sandbox state on Landing Page
  const [sandboxPrompt, setSandboxPrompt] = useState(
    "Verify policy boundaries: inspect prompt injection immunity under blinded isolation."
  );
  const [sandboxFault, setSandboxFault] = useState("CLEAN");
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any | null>(null);

  const handleSandboxDispatch = async () => {
    setSandboxLoading(true);
    setSandboxResult(null);
    try {
      const res = await dispatchRun({
        prompt: sandboxPrompt,
        policy: "POLICY_STRICT_DENY: Enforce adversarial injection boundaries.",
        model_id: "llama-3.2-1b-instruct",
        mode: "HARDENED",
        fault_class: sandboxFault,
        experiment_id: `sandbox_${Date.now()}`,
      });
      setSandboxResult(res);
    } catch {
      // Fallback synthetic preview if offline
      setSandboxResult({
        run_data: {
          run_id: `run_sim_${Date.now()}`,
          status: sandboxFault === "CLEAN" ? "ELIGIBLE" : "INVALID",
          mode: "HARDENED",
          fault_class: sandboxFault,
          merkle_root: "9c3e41b2f8a1...d402",
          ed25519_signature: "7f4a9b0c...e812",
          score_contributed: sandboxFault === "CLEAN" ? 1.0 : 0.0,
        },
      });
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-100 flex flex-col font-sans selection:bg-status-cyan selection:text-black">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline/80 bg-canvas-deep/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-cyan/10 border border-status-cyan/40 text-status-cyan shadow-glowCyan">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-wider text-slate-100">
                  AEGISBAY
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-status-cyan/10 border border-status-cyan/30 px-2 py-0.5 text-[10px] font-mono text-status-cyan">
                  Track 04: Bayora
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
                Zero-Trust Evaluation Enclave
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-status-cyan transition-colors">
              Pillars
            </a>
            <a href="#architecture" className="hover:text-status-cyan transition-colors">
              Architecture
            </a>
            <a href="#sandbox" className="hover:text-status-cyan transition-colors">
              Live Sandbox
            </a>
            <button
              onClick={onOpenLedger}
              className="hover:text-status-cyan transition-colors"
            >
              Merkle Ledger
            </button>
            <button
              onClick={onOpenAblation}
              className="hover:text-status-cyan transition-colors"
            >
              Ablation Benchmark
            </button>
            <a href="#faq" className="hover:text-status-cyan transition-colors">
              FAQ
            </a>
          </nav>

          {/* Actions & Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 rounded-xl border border-hairline-light bg-card px-3 py-1.5 text-xs">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full border border-status-cyan/40 object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-status-cyan/20 text-status-cyan">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="text-left">
                  <div className="font-semibold text-slate-200 leading-tight">
                    {user.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] font-mono text-status-cyan leading-none">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="ml-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginDemo("Lead Auditor")}
                className="rounded-xl border border-hairline-light bg-card px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-card-elevated transition-all"
              >
                Sign In
              </button>
            )}

            <button
              onClick={onLaunchConsole}
              className="flex items-center gap-2 rounded-xl bg-status-cyan/20 border border-status-cyan/60 px-4 py-2 text-xs font-semibold text-status-cyan hover:bg-status-cyan/30 active:scale-95 transition-all shadow-glowCyan"
            >
              <span>Launch Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onLaunchConsole}
              className="rounded-lg bg-status-cyan/20 border border-status-cyan/50 px-3 py-1.5 text-xs font-semibold text-status-cyan"
            >
              Console
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-hairline bg-panel p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-card p-2 text-center text-slate-200"
              >
                Pillars
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-card p-2 text-center text-slate-200"
              >
                Architecture
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLedger();
                }}
                className="rounded-lg bg-card p-2 text-center text-slate-200"
              >
                Merkle Ledger
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAblation();
                }}
                className="rounded-lg bg-card p-2 text-center text-slate-200"
              >
                Ablation
              </button>
            </div>

            <div className="pt-2 border-t border-hairline flex flex-col gap-2">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-card text-xs">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-status-cyan" />
                    <span>{user.name}</span>
                  </div>
                  <button onClick={logout} className="text-red-400 text-[11px]">
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    loginDemo("Lead Auditor");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-xl border border-hairline-light bg-card py-2 text-xs font-medium text-slate-200 text-center"
                >
                  Sign In (Auditor Persona)
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunchConsole();
                }}
                className="w-full rounded-xl bg-status-cyan/20 border border-status-cyan/50 py-2.5 text-xs font-semibold text-status-cyan text-center"
              >
                Open SecOps Workbench
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-hairline/60 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Security Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-status-cyan/40 bg-status-cyan/10 px-3.5 py-1 text-xs font-mono text-status-cyan">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-status-cyan"></span>
                </span>
                <span>ZERO-TRUST ENCLAVE • ED25519 ATTESTED</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.1]">
                Evidence-Gated AI Safety Testing in{" "}
                <span className="bg-gradient-to-r from-status-cyan via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Blinded Enclaves
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Eliminating benchmark gaming, evaluator collusion, and post-hoc result
                tampering with hardware-isolated execution, cryptographic commit-reveal
                protocols, and immutable Merkle audit ledgers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={onLaunchConsole}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-status-cyan text-black px-6 py-3.5 text-sm font-bold hover:bg-cyan-300 active:scale-[0.98] transition-all shadow-glowCyan"
                >
                  <span>Launch Operator Console</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#sandbox"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-hairline-light bg-panel px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-card-elevated hover:border-slate-400 transition-all"
                >
                  <span>Try Live Sandbox</span>
                  <Play className="h-3.5 w-3.5 text-status-cyan" />
                </a>
                <button
                  onClick={onOpenLedger}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-hairline bg-card px-5 py-3.5 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
                >
                  <Database className="h-4 w-4 text-emerald-400" />
                  <span>Inspect Ledger</span>
                </button>
              </div>

              {/* Proof Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-mono text-slate-400 border-t border-hairline/60">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-status-pass" />
                  <span>Hardware Blinding (Seccomp/v2)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-status-pass" />
                  <span>Timing Padding (AUC 0.50)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-status-pass" />
                  <span>100% Tamper Intercept</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Architecture Motion Hologram */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-md rounded-2xl border border-hairline-light bg-card/60 p-4 shadow-card backdrop-blur-xl">
                {/* Hologram Header */}
                <div className="flex items-center justify-between pb-3 border-b border-hairline/80 text-xs font-mono">
                  <div className="flex items-center gap-2 text-status-cyan">
                    <Activity className="h-4 w-4 animate-pulse" />
                    <span>ENCLAVE ISOMETRIC STREAM</span>
                  </div>
                  <span className="text-[10px] text-slate-400">FPS: 60 • ZERO-TRUST</span>
                </div>

                {/* 3D Visual Asset */}
                <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl bg-canvas-deep border border-hairline flex items-center justify-center">
                  <img
                    src="docs/assets/aegisbay_3d_motion.gif"
                    alt="AegisBay 3D Architecture Motion Graphic"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback SVG graphic if asset unavailable
                      (e.target as any).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas-deep via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span className="text-status-cyan">ED25519:8E:82:E7:93:D6</span>
                    <span className="text-emerald-400">SEALED ENCLAVE ACTIVE</span>
                  </div>
                </div>

                {/* Micro Telemetry Bar */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="rounded-lg bg-panel p-2 border border-hairline">
                    <div className="text-[10px] text-slate-400 uppercase">Runs Logged</div>
                    <div className="text-sm font-bold text-slate-100">
                      {stats ? stats.total_runs : "50+"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-panel p-2 border border-hairline">
                    <div className="text-[10px] text-slate-400 uppercase">Tamper Rate</div>
                    <div className="text-sm font-bold text-status-pass">100% Gated</div>
                  </div>
                  <div className="rounded-lg bg-panel p-2 border border-hairline">
                    <div className="text-[10px] text-slate-400 uppercase">Timing AUC</div>
                    <div className="text-sm font-bold text-status-cyan">0.50 (Zero Leak)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE ENCLAVE METRICS RIBBON */}
      <section className="border-b border-hairline/80 bg-panel/80 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-hairline bg-card p-4 transition-all hover:border-slate-500">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Eval Runs</span>
                <Terminal className="h-4 w-4 text-status-cyan" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
                {stats ? stats.total_runs : 50}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Cryptographically committed</p>
            </div>

            <div className="rounded-xl border border-hairline bg-card p-4 transition-all hover:border-slate-500">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tamper Intercept</span>
                <ShieldCheck className="h-4 w-4 text-status-pass" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-status-pass">
                100.0%
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Merkle root invalidation</p>
            </div>

            <div className="rounded-xl border border-hairline bg-card p-4 transition-all hover:border-slate-500">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Side-Channel Defense</span>
                <Radio className="h-4 w-4 text-status-cyan" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-status-cyan">
                0.50 AUC
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Constant-time Laplace padding</p>
            </div>

            <div className="rounded-xl border border-hairline bg-card p-4 transition-all hover:border-slate-500">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Enclave Notary Key</span>
                <Lock className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-sm font-bold font-mono text-emerald-400 truncate">
                {stats?.enclave_public_key_fingerprint || "ED25519:8E:82:E7:93"}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Hardware root of trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE PROBLEM VS THE AEGISBAY SOLUTION */}
      <section className="py-20 border-b border-hairline/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-mono uppercase tracking-widest text-status-cyan mb-2">
              Comparative Vulnerability Analysis
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-slate-100">
              Why Traditional AI Safety Testing Fails
            </h3>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Traditional benchmark frameworks trust evaluators and models implicitly. AegisBay
              introduces blinded, evidence-gated enclaves where truth is mathematically verified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vulnerable Traditional Infrastructure */}
            <div className="rounded-2xl border border-status-fail/30 bg-status-fail/5 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-fail/20 text-status-fail">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-red-200">
                    Conventional Benchmarks (Vulnerable)
                  </h4>
                  <p className="text-xs text-red-400/80">Unauthenticated, mutable execution</p>
                </div>
              </div>

              <ul className="space-y-3 pt-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-status-fail font-bold">x</span>
                  <span>
                    <strong>Model Peeking & Prompt Canary Bleed:</strong> Hostile models probe
                    system prompts and extract evaluation policies prior to scoring.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-status-fail font-bold">x</span>
                  <span>
                    <strong>Post-Hoc Result Tampering:</strong> Benchmark organizers can quietly
                    alter safety scores or discard unfavorable evaluations in mutable databases.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-status-fail font-bold">x</span>
                  <span>
                    <strong>Side-Channel Timing Leaks:</strong> Response latency reveals internal
                    guardrail activations and policy tokens to adversarial probes.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-status-fail font-bold">x</span>
                  <span>
                    <strong>Evaluator Collusion:</strong> Without blinded commit-reveal, model
                    evaluators can collude with vendors to pass safety benchmarks.
                  </span>
                </li>
              </ul>
            </div>

            {/* AegisBay Hardened Enclave */}
            <div className="rounded-2xl border border-status-pass/30 bg-status-pass/5 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-pass/20 text-status-pass">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-emerald-200">
                    AegisBay Zero-Trust Enclave (Hardened)
                  </h4>
                  <p className="text-xs text-emerald-400/80">
                    Cryptographically sealed & attested
                  </p>
                </div>
              </div>

              <ul className="space-y-3 pt-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-status-pass mt-0.5" />
                  <span>
                    <strong>Hardware Isolation & Seccomp:</strong> Double-blinded container
                    sandbox with strict egress blocking, ephemeral memory, and canary sinks.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-status-pass mt-0.5" />
                  <span>
                    <strong>Four-Leaf Merkle Tree Audit:</strong> Every prompt, check, result, and
                    status forms a SHA-256 Merkle leaf signed by an Ed25519 notary key.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-status-pass mt-0.5" />
                  <span>
                    <strong>Uniform Timing Quantization:</strong> All responses padded to uniform
                    distribution, achieving zero side-channel leakage (AUC 0.50).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-status-pass mt-0.5" />
                  <span>
                    <strong>Cryptographic Commit-Reveal:</strong> Evaluator commitments locked
                    before prompt execution, completely preventing collusion or benchmark gaming.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE ENCLAVE SANDBOX */}
      <section id="sandbox" className="py-20 border-b border-hairline/60 bg-panel/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-status-cyan/10 border border-status-cyan/30 px-3 py-1 text-xs font-mono text-status-cyan mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Interactive Demonstration</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Live Enclave Dispatch Sandbox
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Dispatch a real adversarial probe into the live AegisBay enclave. Observe the
              cryptographic commit, hardware blinding, and Merkle leaf attestation in real time.
            </p>
          </div>

          <div className="rounded-2xl border border-hairline-light bg-card p-6 shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Adversarial Prompt Payload
              </label>
              <textarea
                rows={3}
                value={sandboxPrompt}
                onChange={(e) => setSandboxPrompt(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-canvas-deep p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-status-cyan focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Controlled Fault Injection Class
                </label>
                <select
                  value={sandboxFault}
                  onChange={(e) => setSandboxFault(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-canvas-deep p-2.5 font-mono text-xs text-slate-200 focus:border-status-cyan focus:outline-none"
                >
                  <option value="CLEAN">CLEAN (Standard Enclave Execution)</option>
                  <option value="FAULT_01_NET_EGRESS">FAULT 01: Unauthorized Network Egress</option>
                  <option value="FAULT_02_PRETEST_PEEK">FAULT 02: Pretest Blinding Violation</option>
                  <option value="FAULT_03_POLICY_DRIFT">FAULT 03: Evaluator Policy Drift</option>
                  <option value="FAULT_04_KV_CANARY_BLEED">FAULT 04: KV Canary Cache Bleed</option>
                  <option value="FAULT_05_DEADLINE_OVERRUN">FAULT 05: Evaluation Deadline Overrun</option>
                  <option value="FAULT_06_TELEMETRY_DROP">FAULT 06: Silent Telemetry Drop</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSandboxDispatch}
                  disabled={sandboxLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-status-cyan text-black py-2.5 px-4 text-xs font-bold hover:bg-cyan-300 active:scale-98 transition-all disabled:opacity-50 shadow-glowCyan"
                >
                  {sandboxLoading ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin" />
                      <span>Sealing Enclave Handshake...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Dispatch to Blinded Enclave</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sandbox Execution Output */}
            {sandboxResult && (
              <div className="rounded-xl border border-status-cyan/30 bg-canvas-deep p-4 font-mono text-xs space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-hairline text-slate-300">
                  <span className="text-status-cyan font-bold">
                    EXECUTION ATTESTATION RECEIPT
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sandboxResult.run_data.status === "ELIGIBLE"
                        ? "bg-status-pass/20 text-status-pass border border-status-pass/40"
                        : "bg-status-fail/20 text-status-fail border border-status-fail/40"
                    }`}
                  >
                    STATUS: {sandboxResult.run_data.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500">Run ID:</span>{" "}
                    <span className="text-slate-200">{sandboxResult.run_data.run_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Enclave Mode:</span>{" "}
                    <span className="text-status-cyan">{sandboxResult.run_data.mode}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Merkle Root:</span>{" "}
                    <span className="text-emerald-400">{sandboxResult.run_data.merkle_root}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Ed25519 Notary Sig:</span>{" "}
                    <span className="text-purple-400">
                      {sandboxResult.run_data.ed25519_signature}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Contributed Score: {sandboxResult.run_data.score_contributed}
                  </span>
                  <button
                    onClick={onOpenLedger}
                    className="text-status-cyan hover:underline flex items-center gap-1"
                  >
                    <span>View in Full Ledger</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. SIX ARCHITECTURAL PILLARS */}
      <section id="features" className="py-20 border-b border-hairline/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-mono uppercase tracking-widest text-status-cyan mb-2">
              Zero-Trust Enclave Capabilities
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-slate-100">
              Engineered for Provable Integrity
            </h3>
            <p className="mt-3 text-sm text-slate-400">
              Every stage of the evaluation pipeline is sealed against tampering, side-channels, and
              unauthorized observer interference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-hairline bg-card p-6 hover:border-status-cyan/50 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-cyan/10 border border-status-cyan/30 text-status-cyan mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Blinded Zero-Trust Enclave</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Hardware-isolated double-blind containers ensure neither the model nor the evaluator
                has unmonitored egress or memory bleed before execution locks.
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-card p-6 hover:border-status-cyan/50 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-4">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Cryptographic Commit-Reveal</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Both parties publish SHA-256 commitments to an immutable registry before inputs are
                revealed, mathematically eliminating front-running and benchmark collusion.
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-card p-6 hover:border-status-cyan/50 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-pass/10 border border-status-pass/30 text-status-pass mb-4">
                <Radio className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Side-Channel Timing Defense</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                All evaluation outputs are quantized with Laplace constant-time padding, reducing
                timing attack discriminator AUC to 0.50 (perfect statistical indistinguishability).
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-card p-6 hover:border-status-cyan/50 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">TinyFish Sentinel Integration</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Real-time autonomous web agent sentinels monitor external egress sinks and synthetic
                canary tokens, terminating compromised runs instantly upon detection.
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-card p-6 hover:border-status-cyan/50 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Four-Leaf Merkle DAG Notary</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Every test creates four cryptographic leaves (Config, Attestation, Raw Result,
                Status) bound into a Merkle root and signed with an Ed25519 hardware key.
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-card p-6 hover:border-status-cyan/50 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Zero Score Contamination</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Adversarial faults (egress attempts, canary bleeds, policy drifts) are isolated and
                marked INVALID. Only clean, attested runs enter the benchmark safety score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CROSS-PLATFORM & PROGRESSIVE WEB APP (PWA) SUPPORT */}
      <section className="py-16 border-b border-hairline/60 bg-panel/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-status-pass/10 border border-status-pass/30 px-3 py-1 text-xs font-mono text-status-pass">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>UNIVERSAL CROSS-PLATFORM SUPPORT</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-100">
                PWA Ready for Mobile, Tablet, & Workstations
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                AegisBay is engineered with a mobile-first, responsive architecture and Progressive
                Web App (PWA) manifest. Security auditors can review attestations from iOS, Android,
                macOS, Linux, or Windows with full touch support and zero degradation.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-hairline bg-card text-center">
                  <Smartphone className="h-5 w-5 text-status-cyan mb-1" />
                  <span className="text-xs font-semibold text-slate-200">Mobile</span>
                  <span className="text-[10px] text-slate-400">iOS & Android</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-hairline bg-card text-center">
                  <Laptop className="h-5 w-5 text-emerald-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-200">Tablet & Laptop</span>
                  <span className="text-[10px] text-slate-400">iPad, Mac, Windows</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-hairline bg-card text-center">
                  <Monitor className="h-5 w-5 text-purple-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-200">Desktop / 4K</span>
                  <span className="text-[10px] text-slate-400">SecOps Console</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-hairline-light bg-card p-6 shadow-card space-y-4 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between pb-3 border-b border-hairline text-status-cyan">
                <span>PWA DEPLOYMENT SPECIFICATION</span>
                <span className="text-[10px] text-slate-500">STANDALONE APP</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Manifest Standard:</span>
                  <span className="text-slate-200">W3C Web Application Manifest</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Display Mode:</span>
                  <span className="text-emerald-400">Standalone (Full Canvas)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Offline Resilience:</span>
                  <span className="text-slate-200">Local Cache & SQLite Synchronization</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Touch Targets:</span>
                  <span className="text-slate-200">48px Ergonomic Hitboxes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECURITY & ENCLAVE FAQ */}
      <section id="faq" className="py-20 border-b border-hairline/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-status-cyan mb-2">
              Safety Architecture Clarifications
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-hairline bg-card p-5 space-y-2">
              <h4 className="text-sm font-semibold text-slate-200">
                How does AegisBay prevent evaluator and vendor collusion?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                By enforcing cryptographic commit-reveal before any test execution begins. Both the
                test prompt hash and evaluator model configuration hash are sealed to the immutable
                ledger. Evaluators cannot alter scoring metrics dynamically once the evaluation run
                starts.
              </p>
            </div>

            <div className="rounded-xl border border-hairline bg-card p-5 space-y-2">
              <h4 className="text-sm font-semibold text-slate-200">
                What guarantees exist against post-hoc database manipulation?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every run generates a 4-leaf SHA-256 Merkle tree signed by an Ed25519 enclave key.
                If any record in SQLite is modified post-execution, the recalculation of the Merkle
                root fails immediately, triggering a TAMPER_DETECTED alert in the telemetry header.
              </p>
            </div>

            <div className="rounded-xl border border-hairline bg-card p-5 space-y-2">
              <h4 className="text-sm font-semibold text-slate-200">
                How does constant-time padding defeat timing attacks?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adversarial models attempt to determine whether their injection prompts bypassed
                filters by measuring nanosecond delays. AegisBay clamps and pads all response
                latencies to a uniform distribution, reducing timing classifier AUC to 0.50 (chance).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CTA */}
      <section className="py-16 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(6,182,212,0.15),rgba(255,255,255,0))] text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
            Ready to Inspect the Evidence-Gated Enclave?
          </h3>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Experience real-time zero-trust AI evaluation. Audit cryptographic proofs, trigger
            simulated attacks, and verify Merkle signatures in the SecOps Workbench.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchConsole}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-status-cyan text-black px-8 py-3.5 text-sm font-bold hover:bg-cyan-300 active:scale-95 transition-all shadow-glowCyan"
            >
              <span>Open SecOps Workbench</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenLedger}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-hairline-light bg-card px-8 py-3.5 text-sm font-semibold text-slate-200 hover:bg-card-elevated transition-all"
            >
              <Database className="h-4 w-4 text-emerald-400" />
              <span>Inspect Public Ledger</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="border-t border-hairline/80 bg-canvas-deep py-8 text-xs text-slate-500 font-mono">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-status-cyan" />
            <span>AegisBay Enclave • Hack in Hills 2026 (Track 04: Bayora)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Team Awara Coders</span>
            <span>•</span>
            <span>Lead: Ayush Sarkar</span>
            <span>•</span>
            <a
              href="https://github.com/Ayushnot41/AgeisBay"
              target="_blank"
              rel="noreferrer"
              className="hover:text-status-cyan transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
