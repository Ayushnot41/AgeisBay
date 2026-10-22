"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TinyFishStatus,
  TinyFishProbeResult,
  TinyFishThreat,
  getTinyFishStatus,
  executeBoundaryEgressProbe,
  getTinyFishThreats
} from "@/lib/api";
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Send,
  Zap,
  CheckCircle2,
  Lock,
  Radio,
  ExternalLink,
  Cpu,
  Radar,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface Props {
  onLoadThreatIntoDispatcher?: (threat: TinyFishThreat) => void;
}

export default function TinyFishSentinelCard({ onLoadThreatIntoDispatcher }: Props) {
  const [status, setStatus] = useState<TinyFishStatus | null>(null);
  const [threats, setThreats] = useState<TinyFishThreat[]>([]);
  const [probeResult, setProbeResult] = useState<TinyFishProbeResult | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [canaryInput, setCanaryInput] = useState("CANARY_SEC_TOKEN_ALPHA_9918");
  const [loadedThreatId, setLoadedThreatId] = useState<string | null>(null);

  useEffect(() => {
    getTinyFishStatus().then(setStatus).catch(console.error);
    getTinyFishThreats().then(setThreats).catch(console.error);
  }, []);

  const handleRunProbe = async () => {
    setIsProbing(true);
    try {
      const res = await executeBoundaryEgressProbe(canaryInput);
      setProbeResult(res);
    } catch (err) {
      console.error("Probe failed:", err);
    } finally {
      setIsProbing(false);
    }
  };

  const handleLoadThreat = (threat: TinyFishThreat) => {
    setLoadedThreatId(threat.id);
    if (onLoadThreatIntoDispatcher) {
      onLoadThreatIntoDispatcher(threat);
    }
    setTimeout(() => setLoadedThreatId(null), 2500);
  };

  return (
    <div className="card-elevated rounded-lg p-3.5 flex flex-col border border-[#1E2A3C] bg-[#0B0F17]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
            TINYFISH WEB SENTINEL &amp; ADVERSARIAL EGRESS PROBE
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {status?.status || "OPERATIONAL"}
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-[#07090E] px-2 py-0.5 rounded border border-[#1E293B]">
            {status?.masked_key || "sk-tiny...BYgI"}
          </span>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
        {/* Left: Boundary Egress Probing */}
        <div className="flex flex-col gap-2 p-2.5 rounded bg-[#070A10] border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              EXTERNAL EGRESS CONTAINMENT TEST
            </span>
            <span className="text-[10px] font-mono text-slate-400">SEMAPHORE: DROP_ALL</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-400">CANARY PAYLOAD TO EXFILTRATE</label>
            <input
              type="text"
              value={canaryInput}
              onChange={(e) => setCanaryInput(e.target.value)}
              className="bg-[#05070B] border border-[#1E293B] rounded px-2.5 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleRunProbe}
              disabled={isProbing}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all disabled:opacity-50 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            >
              <Radio className={`w-3.5 h-3.5 ${isProbing ? "animate-spin" : ""}`} />
              {isProbing ? "DISPATCHING AUTONOMOUS PROBE..." : "RUN AUTONOMOUS WEB EGRESS PROBE"}
            </motion.button>
          </div>

          {probeResult && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 p-2 rounded bg-black/60 border border-emerald-500/40 text-[10px] font-mono flex flex-col gap-1"
            >
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  STATUS: {probeResult.enclave_boundary_status}
                </span>
                <span>BYTES EXFILTRATED: {probeResult.bytes_exfiltrated}</span>
              </div>
              <div className="text-slate-400 truncate">
                DIGEST: <span className="text-slate-200">{probeResult.sha256_probe_digest}</span>
              </div>
              <div className="text-slate-400 flex items-center justify-between">
                <span>SUBSYSTEM: {probeResult.interception_subsystem}</span>
                <span className="text-emerald-400 font-semibold">TINYFISH VERIFIED</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Live Threat Benchmark Feed */}
        <div className="flex flex-col gap-1.5 p-2.5 rounded bg-[#070A10] border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              TINYFISH LIVE ADVERSARIAL THREAT FEED
            </span>
            <span className="text-[10px] font-mono text-slate-400">HACK IN HILLS '26</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {threats.map((threat) => (
              <div
                key={threat.id}
                className="flex items-center justify-between p-1.5 rounded bg-[#05070B] border border-[#1E293B]/80 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-200 truncate">
                      {threat.name}
                    </span>
                    <span
                      className={`px-1 py-0.2 text-[9px] font-mono rounded ${
                        threat.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {threat.severity}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 truncate">
                    {threat.payload}
                  </span>
                </div>
                <button
                  onClick={() => handleLoadThreat(threat)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                    loadedThreatId === threat.id
                      ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400"
                      : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  }`}
                  title="Load threat vector into Commit-Reveal Dispatcher"
                >
                  {loadedThreatId === threat.id ? "LOADED" : "LOAD"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
