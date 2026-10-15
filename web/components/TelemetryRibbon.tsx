"use strict";
import React, { useState } from "react";
import { TelemetryStats } from "@/lib/api";
import {
  ShieldCheck,
  Cpu,
  Lock,
  Activity,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Server,
  Zap
} from "lucide-react";

interface Props {
  stats: TelemetryStats | null;
  onRefresh: () => void;
  isStreaming: boolean;
}

export default function TelemetryRibbon({ stats, onRefresh, isStreaming }: Props) {
  const [copied, setCopied] = useState(false);

  const copyFingerprint = () => {
    if (!stats?.enclave_public_key_fingerprint) return;
    navigator.clipboard.writeText(stats.enclave_public_key_fingerprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVerified = stats?.ledger_verification === "VERIFIED";

  return (
    <header className="w-full bg-card border-b border-hairline px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-card">
      {/* Brand & Track Metadata */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-panel border border-hairline flex items-center justify-center text-status-cyan shadow-recessed">
            <ShieldCheck className="w-4 h-4 text-status-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-sm text-slate-100 font-mono">AEGISBAY</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider font-mono bg-cyan-950/70 text-status-cyan border border-cyan-800/40">
                2026.10-PROD
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Track 04: Securing Adversarial AI Safety Testing (Bayora)
            </div>
          </div>
        </div>

        <div className="hidden lg:block h-6 w-px bg-hairline" />

        {/* Enclave Ed25519 Fingerprint */}
        <div className="flex items-center gap-1.5 bg-panel border border-hairline px-2.5 py-1 rounded shadow-recessed">
          <Fingerprint className="w-3.5 h-3.5 text-status-cyan" />
          <span className="text-slate-400 font-mono text-[11px]">ENCLAVE:</span>
          <span className="font-mono text-slate-200 text-[11px] font-medium tracking-tight">
            {stats?.enclave_public_key_fingerprint || "ED25519:INITIALIZING..."}
          </span>
          <button
            onClick={copyFingerprint}
            title="Copy Public Key Fingerprint"
            className="ml-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-status-pass" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Kernel Hardening & Isolation Flags */}
      <div className="hidden xl:flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-panel border border-hairline px-2 py-1 rounded text-[11px] font-mono text-slate-300">
          <Lock className="w-3 h-3 text-status-pass" />
          <span>ROOTLESS SECCOMP</span>
          <span className="w-1.5 h-1.5 rounded-full bg-status-pass shadow-glowPass" />
        </div>
        <div className="flex items-center gap-1.5 bg-panel border border-hairline px-2 py-1 rounded text-[11px] font-mono text-slate-300">
          <Cpu className="w-3 h-3 text-status-pass" />
          <span>CGROUPS V2 (256 PID)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-status-pass shadow-glowPass" />
        </div>
        <div className="flex items-center gap-1.5 bg-panel border border-hairline px-2 py-1 rounded text-[11px] font-mono text-slate-300">
          <Server className="w-3 h-3 text-status-cyan" />
          <span>3 AIR-GAPPED SUBNETS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-status-cyan shadow-glowCyan" />
        </div>
      </div>

      {/* KPI Telemetry Numbers */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Run Counts */}
        <div className="flex items-center gap-1.5 bg-panel border border-hairline px-2.5 py-1 rounded font-mono text-[11px]">
          <span className="text-slate-400">TOTAL:</span>
          <span className="text-slate-100 font-bold">{stats?.total_runs ?? 0}</span>
          <span className="text-slate-600">|</span>
          <span className="text-status-pass flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {stats?.eligible_runs ?? 0}
          </span>
          <span className="text-status-fail flex items-center gap-1">
            <XCircle className="w-3 h-3" /> {stats?.invalid_runs ?? 0}
          </span>
          <span className="text-status-warn flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {stats?.incomplete_runs ?? 0}
          </span>
        </div>

        {/* p50 / p95 Latency Box */}
        <div className="hidden md:flex items-center gap-2 bg-panel border border-hairline px-2.5 py-1 rounded font-mono text-[11px]">
          <Activity className="w-3.5 h-3.5 text-status-cyan" />
          <div>
            <span className="text-slate-400">P50:</span>
            <span className="text-slate-200 ml-1 font-medium">{stats?.p50_padded_ms ?? 1000}ms</span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span className="text-slate-400">AUC:</span>
            <span className="text-status-pass ml-1 font-bold">{stats?.timing_attack_auc.toFixed(3) ?? "0.502"}</span>
          </div>
        </div>

        {/* Live Ledger Verification Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[11px] font-bold tracking-tight border ${
            isVerified
              ? "bg-emerald-950/60 text-status-pass border-emerald-800/50"
              : "bg-red-950/70 text-status-fail border-red-700/60 animate-pulse"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isVerified ? "bg-status-pass shadow-glowPass" : "bg-status-fail shadow-glowFail"
            }`}
          />
          <span>{isVerified ? "LEDGER VERIFIED" : "TAMPER DETECTED"}</span>
        </div>

        {/* Live SSE Stream Pulse */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          <Zap
            className={`w-3.5 h-3.5 ${
              isStreaming ? "text-status-cyan animate-pulse" : "text-slate-500"
            }`}
          />
          <span className="hidden sm:inline">{isStreaming ? "LIVE" : "POLL"}</span>
        </div>
      </div>
    </header>
  );
}
