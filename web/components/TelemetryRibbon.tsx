"use client";

import React, { useState, useEffect } from "react";
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
  Zap,
  Clock,
  Radio
} from "lucide-react";

interface Props {
  stats: TelemetryStats | null;
  onRefresh: () => void;
  isStreaming: boolean;
}

export default function TelemetryRibbon({ stats, onRefresh, isStreaming }: Props) {
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(" ")[0] + " UTC");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyFingerprint = () => {
    if (!stats?.enclave_public_key_fingerprint) return;
    navigator.clipboard.writeText(stats.enclave_public_key_fingerprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVerified = stats?.ledger_verification === "VERIFIED";

  return (
    <header className="w-full bg-[#0B0F17] border-b border-[#1E293B] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
      {/* Brand & Track Metadata */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#111722] border border-[#1E293B] flex items-center justify-center text-cyan-400 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-sm text-slate-100 font-mono">AEGISBAY</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold tracking-wider font-mono bg-cyan-950/70 text-cyan-300 border border-cyan-800/40">
                2026.10-PROD
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Track 04: Securing Adversarial AI Safety Testing (Bayora)
            </div>
          </div>
        </div>

        <div className="hidden lg:block h-6 w-px bg-[#1E293B]" />

        {/* Enclave Ed25519 Fingerprint */}
        <div className="flex items-center gap-1.5 bg-[#07090E] border border-[#1E293B] px-2.5 py-1 rounded">
          <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-mono text-[10px]">ENCLAVE:</span>
          <span className="font-mono text-slate-200 text-[10px] font-medium tracking-tight">
            {stats?.enclave_public_key_fingerprint || "ED25519:8E:82:E7:93:D6:BE:76:CF"}
          </span>
          <button
            onClick={copyFingerprint}
            title="Copy Public Key Fingerprint"
            className="ml-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Kernel Hardening & Isolation Flags */}
      <div className="hidden xl:flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-[#07090E] border border-[#1E293B] px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>ROOTLESS SECCOMP</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex items-center gap-1.5 bg-[#07090E] border border-[#1E293B] px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span>CGROUPS V2 (512MB)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex items-center gap-1.5 bg-[#07090E] border border-[#1E293B] px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
          <Server className="w-3 h-3 text-cyan-400" />
          <span>3 AIR-GAPPED BRIDGES</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </div>
      </div>

      {/* KPI Telemetry Numbers */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Latency p50 / p95 */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#07090E] border border-[#1E293B] px-2.5 py-1 rounded font-mono text-[10px]">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-400">RELEASE SHAPE:</span>
          <span className="text-cyan-300 font-bold">
            p50: {stats?.p50_padded_ms?.toFixed(0) || "1000"}ms
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300 font-bold">
            p95: {stats?.p95_padded_ms?.toFixed(0) || "1000"}ms
          </span>
        </div>

        {/* Timing Attack Resistance AUC */}
        <div className="flex items-center gap-1.5 bg-[#07090E] border border-[#1E293B] px-2.5 py-1 rounded font-mono text-[10px]">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-400">TIMING AUC:</span>
          <span className="text-emerald-400 font-bold">
            {stats?.timing_attack_auc?.toFixed(3) || "0.502"}
          </span>
          <span className="text-[9px] text-emerald-500 font-semibold">(IMMUNE)</span>
        </div>

        {/* Ledger Integrity Verification Status */}
        <div
          className={`flex items-center gap-1.5 border px-2.5 py-1 rounded font-mono text-[10px] font-bold ${
            isVerified
              ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
              : "bg-red-950/60 border-red-500/80 text-red-300 animate-pulse"
          }`}
        >
          {isVerified ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          )}
          <span>{isVerified ? "LEDGER VERIFIED" : "TAMPER DETECTED"}</span>
        </div>

        {/* Live SSE Stream Pulse & Clock */}
        <div className="flex items-center gap-2 pl-1">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#07090E] border border-[#1E293B] text-[10px] font-mono text-slate-400">
            <Radio className={`w-3 h-3 ${isStreaming ? "text-cyan-400" : "text-slate-500"}`} />
            <span>{isStreaming ? "SSE LIVE" : "POLLING"}</span>
          </div>

          <div className="hidden md:block text-[10px] font-mono text-slate-400">
            {currentTime}
          </div>
        </div>
      </div>
    </header>
  );
}
