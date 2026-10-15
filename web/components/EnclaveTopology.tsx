"use strict";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Network,
  Shield,
  Lock,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  AlertOctagon
} from "lucide-react";

interface Props {
  onOpenDagModal: () => void;
  activeFault?: string;
}

export default function EnclaveTopology({ onOpenDagModal, activeFault = "CLEAN" }: Props) {
  const [selectedSubnet, setSelectedSubnet] = useState<string>("mediator");

  const isNetEgressFault = activeFault === "FAULT_01_NET_EGRESS";
  const isPeekFault = activeFault === "FAULT_02_PRETEST_PEEK";
  const isPolicyDriftFault = activeFault === "FAULT_03_POLICY_DRIFT";
  const isCanaryFault = activeFault === "FAULT_04_KV_CANARY_BLEED";

  return (
    <div className="card-elevated rounded-lg p-3.5 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-hairline">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-status-cyan" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
            PANEL A: ENCLAVE TOPOLOGY &amp; BOUNDARY MONITOR
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">
            NET: <span className="text-status-pass">AIR-GAPPED BRIDGES</span>
          </span>
          <button
            onClick={onOpenDagModal}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-panel hover:bg-panel-hover text-[11px] font-mono text-status-cyan border border-hairline transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>DAG AST</span>
          </button>
        </div>
      </div>

      {/* Interactive Topology Visual Canvas */}
      <div className="telemetry-well rounded-md p-3 relative flex-1 flex flex-col justify-between overflow-hidden min-h-[220px]">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#334155 1px, transparent 1px), radial-gradient(#1E293B 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
          }}
        />

        {/* 3 Subnets + Mediator Topology Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Subnet 1: Red Workspace */}
          <div
            onClick={() => setSelectedSubnet("red")}
            className={`p-2.5 rounded border transition-all cursor-pointer ${
              selectedSubnet === "red"
                ? "bg-red-950/40 border-red-500 shadow-glowFail"
                : "bg-panel/90 border-red-900/40 hover:border-red-700/60"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold font-mono tracking-wider text-status-fail">
                RED SUBNET
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-red-300">
                172.28.1.0/24
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-200">Adversary Generator</div>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>cap_drop: [ALL]</span>
              <span className="text-status-pass">SECCOMP</span>
            </div>
            {isNetEgressFault && (
              <div className="mt-1.5 px-1.5 py-0.5 rounded bg-red-900/60 text-red-200 text-[10px] font-mono flex items-center gap-1 border border-red-600 animate-pulse">
                <AlertOctagon className="w-3 h-3 text-red-400" />
                <span>UNAUTHORIZED PROBE CAUGHT</span>
              </div>
            )}
          </div>

          {/* Core: Trusted Mediator Gateway */}
          <div
            onClick={() => setSelectedSubnet("mediator")}
            className={`p-2.5 rounded border transition-all cursor-pointer relative overflow-hidden ${
              selectedSubnet === "mediator"
                ? "bg-cyan-950/40 border-cyan-500 shadow-glowCyan"
                : "bg-panel/90 border-cyan-900/40 hover:border-cyan-700/60"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold font-mono tracking-wider text-status-cyan">
                TRUSTED MEDIATOR
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-cyan-300">
                172.28.0.2
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-200">Zero-Trust Sealed Enclave</div>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>RAM Decryption</span>
              <span className="text-status-pass">1000ms SHAPED</span>
            </div>

            {/* Micro active animated beam */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-status-cyan w-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>

          {/* Subnet 2: Blue Workspace */}
          <div
            onClick={() => setSelectedSubnet("blue")}
            className={`p-2.5 rounded border transition-all cursor-pointer ${
              selectedSubnet === "blue"
                ? "bg-blue-950/40 border-blue-500 shadow-card"
                : "bg-panel/90 border-blue-900/40 hover:border-blue-700/60"
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
            <div className="text-[11px] font-medium text-slate-200">Defense Policy Realm</div>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Blinding Barrier</span>
              <span className="text-status-pass">FROZEN DIGEST</span>
            </div>
            {(isPeekFault || isPolicyDriftFault) && (
              <div className="mt-1.5 px-1.5 py-0.5 rounded bg-red-900/60 text-red-200 text-[10px] font-mono flex items-center gap-1 border border-red-600 animate-pulse">
                <AlertOctagon className="w-3 h-3 text-red-400" />
                <span>{isPeekFault ? "PEEK INTERCEPTED" : "POLICY DRIFT CAUGHT"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Directed Pipeline Arrows & Subnet 3: LLM Enclave */}
        <div className="relative z-10 my-2 pt-2 border-t border-hairline/60 flex items-center justify-between gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1 text-slate-400">
            <span className="text-status-fail font-semibold">RED</span>
            <ArrowRight className="w-3 h-3 text-status-cyan" />
            <span className="text-status-cyan font-semibold">AES-256-GCM (AAD: run_id)</span>
            <ArrowRight className="w-3 h-3 text-status-cyan" />
            <span className="text-status-pass font-semibold">ISOLATED LLM</span>
          </div>

          <div
            onClick={() => setSelectedSubnet("llm")}
            className={`px-3 py-1.5 rounded border transition-all cursor-pointer flex items-center gap-2 ${
              selectedSubnet === "llm"
                ? "bg-emerald-950/40 border-emerald-500 text-status-pass"
                : "bg-panel border-hairline text-slate-300 hover:border-slate-600"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-status-pass" />
            <span>LLM ENCLAVE (172.28.3.0/24)</span>
            {isCanaryFault && (
              <span className="px-1 py-0.2 rounded bg-red-900 text-red-200 text-[9px] font-mono animate-pulse">
                CANARY BLEED
              </span>
            )}
          </div>
        </div>

        {/* Boundary Invariant Indicators */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-hairline/60 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 bg-card/80 px-2 py-1 rounded border border-hairline">
            <Shield className="w-3 h-3 text-status-pass" />
            <span className="text-slate-400">Egress Block:</span>
            <span className="text-slate-200 font-semibold">{isNetEgressFault ? "TRIPPED" : "ENFORCED"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card/80 px-2 py-1 rounded border border-hairline">
            <Lock className="w-3 h-3 text-status-pass" />
            <span className="text-slate-400">Blinding:</span>
            <span className="text-slate-200 font-semibold">{isPeekFault ? "BREACH_HALT" : "100% BLIND"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card/80 px-2 py-1 rounded border border-hairline">
            <Layers className="w-3 h-3 text-status-pass" />
            <span className="text-slate-400">Policy Freeze:</span>
            <span className="text-slate-200 font-semibold">{isPolicyDriftFault ? "DRIFT_REJECT" : "BOUND"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card/80 px-2 py-1 rounded border border-hairline">
            <CheckCircle className="w-3 h-3 text-status-pass" />
            <span className="text-slate-400">KV Flush:</span>
            <span className="text-slate-200 font-semibold">{isCanaryFault ? "LEAK_CAUGHT" : "SANITIZED"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
