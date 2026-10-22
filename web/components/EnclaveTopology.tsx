"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Shield,
  Lock,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  AlertOctagon,
  Eye,
  Server,
  Zap,
  Activity,
  Box
} from "lucide-react";

interface Props {
  onOpenDagModal: () => void;
  activeFault?: string;
}

export default function EnclaveTopology({ onOpenDagModal, activeFault = "CLEAN" }: Props) {
  const [selectedSubnet, setSelectedSubnet] = useState<string>("mediator");
  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");

  const isNetEgressFault = activeFault === "FAULT_01_NET_EGRESS";
  const isPeekFault = activeFault === "FAULT_02_PRETEST_PEEK";
  const isPolicyDriftFault = activeFault === "FAULT_03_POLICY_DRIFT";
  const isCanaryFault = activeFault === "FAULT_04_KV_CANARY_BLEED";

  return (
    <div className="card-elevated rounded-lg p-3.5 flex flex-col h-full border border-[#1E2A3C] bg-[#0B0F17]">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
            PANEL A: ENCLAVE TOPOLOGY &amp; BOUNDARY MONITOR
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* 3D vs 2D Toggle Button */}
          <div className="flex items-center bg-[#07090E] p-0.5 rounded border border-[#1E293B] text-[10px] font-mono">
            <button
              onClick={() => setViewMode("3D")}
              className={`px-2 py-0.5 rounded transition-all ${
                viewMode === "3D"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              3D STACK
            </button>
            <button
              onClick={() => setViewMode("2D")}
              className={`px-2 py-0.5 rounded transition-all ${
                viewMode === "2D"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              2D MATRIX
            </button>
          </div>

          <button
            onClick={onOpenDagModal}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#111722] hover:bg-[#161E2E] text-[11px] font-mono text-cyan-400 border border-[#1E293B] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>DAG AST</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="telemetry-well rounded-md p-3 relative flex-1 flex flex-col justify-between overflow-hidden min-h-[260px] bg-[#070A10]">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#334155 1px, transparent 1px), radial-gradient(#1E293B 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
          }}
        />

        {viewMode === "3D" ? (
          /* 3D ISOMETRIC ENCLAVE HARDWARE STACK */
          <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center py-4 perspective-1000">
            <div className="isometric-stack w-full max-w-sm flex flex-col gap-3 py-2 cursor-pointer select-none">
              
              {/* Layer 1: Red Subnet Plane */}
              <motion.div
                whileHover={{ translateZ: 16 }}
                onClick={() => setSelectedSubnet("red")}
                className={`p-3 rounded-lg border backdrop-blur-md transition-all ${
                  selectedSubnet === "red"
                    ? "bg-red-950/60 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    : "bg-[#0D111A]/90 border-red-900/50 hover:border-red-700/80"
                }`}
                style={{ transform: "translateZ(30px)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[11px] font-bold font-mono tracking-wider text-red-400">
                      LAYER 01: ADVERSARY WORKSPACE
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-red-300 border border-red-900/50">
                    red_net · 172.28.1.0/24
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>UNTRUSTED GENERATOR</span>
                  <span className="text-emerald-400">cgroups_v2: 512MB</span>
                </div>
                {isNetEgressFault && (
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-red-900/80 text-red-100 text-[10px] font-mono flex items-center gap-1.5 border border-red-500 animate-pulse">
                    <AlertOctagon className="w-3 h-3 text-red-300" />
                    <span>FAULT 01: OUTBOUND PROBE DROPPED BY SECCOMP</span>
                  </div>
                )}
              </motion.div>

              {/* Layer 2: Trusted Mediator Gateway (Enclave Center) */}
              <motion.div
                whileHover={{ translateZ: 20 }}
                onClick={() => setSelectedSubnet("mediator")}
                className={`p-3.5 rounded-lg border backdrop-blur-md transition-all ${
                  selectedSubnet === "mediator"
                    ? "bg-cyan-950/50 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)]"
                    : "bg-[#111722]/95 border-cyan-800/60 hover:border-cyan-600/80"
                }`}
                style={{ transform: "translateZ(15px)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] font-bold font-mono tracking-wider text-cyan-300">
                      LAYER 02: TRUSTED MEDIATOR ENCLAVE
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-cyan-300 border border-cyan-900/50">
                    RAM-ONLY DECRYPT
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span className="text-slate-400">AES-256-GCM + AAD GATE</span>
                  <span className="text-cyan-400 font-bold">1000ms CONSTANT-TIME</span>
                </div>
                {isPeekFault && (
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-amber-900/80 text-amber-100 text-[10px] font-mono flex items-center gap-1.5 border border-amber-500 animate-pulse">
                    <AlertOctagon className="w-3 h-3 text-amber-300" />
                    <span>FAULT 02: PRE-TEST PLAINTEXT BLINDING ENFORCED</span>
                  </div>
                )}
              </motion.div>

              {/* Layer 3: Blue Defense & Isolated Client LLM */}
              <motion.div
                whileHover={{ translateZ: 16 }}
                onClick={() => setSelectedSubnet("blue")}
                className={`p-3 rounded-lg border backdrop-blur-md transition-all ${
                  selectedSubnet === "blue"
                    ? "bg-blue-950/60 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    : "bg-[#0D111A]/90 border-blue-900/50 hover:border-blue-700/80"
                }`}
                style={{ transform: "translateZ(0px)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-[11px] font-bold font-mono tracking-wider text-blue-300">
                      LAYER 03: BLUE POLICY &amp; CLIENT LLM
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-blue-300 border border-blue-900/50">
                    blue_net · 172.28.2.0/24
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>FROZEN POLICY DIGEST</span>
                  <span className="text-emerald-400">KV-CACHE FLUSH</span>
                </div>
                {isPolicyDriftFault && (
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-rose-900/80 text-rose-100 text-[10px] font-mono flex items-center gap-1.5 border border-rose-500 animate-pulse">
                    <AlertOctagon className="w-3 h-3 text-rose-300" />
                    <span>FAULT 03: POLICY DRIFT CAUGHT (HASH MISMATCH)</span>
                  </div>
                )}
                {isCanaryFault && (
                  <div className="mt-1.5 px-2 py-0.5 rounded bg-rose-900/80 text-rose-100 text-[10px] font-mono flex items-center gap-1.5 border border-rose-500 animate-pulse">
                    <AlertOctagon className="w-3 h-3 text-rose-300" />
                    <span>FAULT 04: CROSS-SESSION KV CANARY LEAK CAUGHT</span>
                  </div>
                )}
              </motion.div>

            </div>
          </div>
        ) : (
          /* 2D HIGH-DENSITY SECPOS MATRIX */
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-2.5 my-auto">
            {/* Red Subnet */}
            <div
              onClick={() => setSelectedSubnet("red")}
              className={`p-2.5 rounded border transition-all cursor-pointer ${
                selectedSubnet === "red"
                  ? "bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  : "bg-[#0D111A]/90 border-red-900/40 hover:border-red-700/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold font-mono tracking-wider text-red-400">
                  RED SUBNET
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-red-300">
                  172.28.1.0/24
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-200">Adversary Generator</div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>cap_drop: [ALL]</span>
                <span className="text-emerald-400">SECCOMP</span>
              </div>
            </div>

            {/* Mediator */}
            <div
              onClick={() => setSelectedSubnet("mediator")}
              className={`p-2.5 rounded border transition-all cursor-pointer ${
                selectedSubnet === "mediator"
                  ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "bg-[#0D111A]/90 border-cyan-900/40 hover:border-cyan-700/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold font-mono tracking-wider text-cyan-300">
                  TRUSTED MEDIATOR
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-cyan-300">
                  RAM ONLY
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-200">Commit-Reveal Gate</div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>AES-256-GCM + AAD</span>
                <span className="text-cyan-400">1000ms SHAPE</span>
              </div>
            </div>

            {/* Blue Subnet */}
            <div
              onClick={() => setSelectedSubnet("blue")}
              className={`p-2.5 rounded border transition-all cursor-pointer ${
                selectedSubnet === "blue"
                  ? "bg-blue-950/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "bg-[#0D111A]/90 border-blue-900/40 hover:border-blue-700/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold font-mono tracking-wider text-blue-400">
                  BLUE SUBNET
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-blue-300">
                  172.28.2.0/24
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-200">Defense &amp; LLM Worker</div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Policy Frozen</span>
                <span className="text-emerald-400">KV PURGE</span>
              </div>
            </div>
          </div>
        )}

        {/* Deep Kernel Telemetry & Invariants Readout */}
        <div className="relative z-10 pt-2.5 mt-2 border-t border-[#1E293B]/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
          <div className="flex flex-col">
            <span className="text-slate-500">CGROUPS V2</span>
            <span className="text-slate-200 font-semibold">cpu.max 100000 / 1core</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500">MEMORY CEILING</span>
            <span className="text-slate-200 font-semibold">memory.max 512MB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500">SECCOMP FILTER</span>
            <span className="text-emerald-400 font-semibold">12 SYSCALLS BLOCKED</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500">NETWORK BOUNDARY</span>
            <span className="text-cyan-400 font-semibold">EBTABLES DROP ALL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
