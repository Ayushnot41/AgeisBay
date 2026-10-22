"use client";

import React, { useState, useEffect } from "react";
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
  Cpu
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

  return (
    <div className="card-elevated rounded-lg p-3.5 flex flex-col border border-hairline bg-[#0D111A]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-hairline">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
            TinyFish Web Sentinel & Adversarial Egress Probe
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {status?.status || "OPERATIONAL"}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {status?.masked_key || "sk-tiny...BYgI"}
          </span>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
        {/* Left: Boundary Egress Probing */}
        <div className="flex flex-col gap-2 p-2.5 rounded bg-black/30 border border-hairline/60">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-status-cyan" />
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
              className="bg-[#07090E] border border-hairline rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-slate-500"
            />
          </div>

          <button
            onClick={handleRunProbe}
            disabled={isProbing}
            className="mt-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors disabled:opacity-50"
          >
            <Radio className={`w-3 h-3 ${isProbing ? "animate-spin" : ""}`} />
            {isProbing ? "DISPATCHING PROBE VIA TINYFISH..." : "RUN AUTONOMOUS WEB EGRESS PROBE"}
          </button>

          {probeResult && (
            <div className="mt-1.5 p-2 rounded bg-black/50 border border-emerald-500/30 text-[10px] font-mono flex flex-col gap-1">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  STATUS: {probeResult.enclave_boundary_status}
                </span>
                <span>BYTES EXFILTRATED: {probeResult.bytes_exfiltrated}</span>
              </div>
              <div className="text-slate-400 truncate">
                PROBE DIGEST: <span className="text-slate-200">{probeResult.sha256_probe_digest}</span>
              </div>
              <div className="text-slate-400">
                SUBSYSTEM: <span className="text-slate-300">{probeResult.interception_subsystem}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Threat Benchmark Feed */}
        <div className="flex flex-col gap-1.5 p-2.5 rounded bg-black/30 border border-hairline/60">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              TINYFISH LIVE ADVERSARIAL THREAT FEED
            </span>
            <span className="text-[10px] font-mono text-slate-400">HACK IN HILLS BENCHMARK</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {threats.map((threat) => (
              <div
                key={threat.id}
                className="flex items-center justify-between p-1.5 rounded bg-[#07090E] border border-hairline/50 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-200 truncate">
                      {threat.name}
                    </span>
                    <span
                      className={`px-1 py-0.2 text-[9px] font-mono rounded ${
                        threat.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {threat.severity}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 truncate">
                    {threat.payload}
                  </span>
                </div>
                {onLoadThreatIntoDispatcher && (
                  <button
                    onClick={() => onLoadThreatIntoDispatcher(threat)}
                    className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
                    title="Load this threat vector into Commit-Reveal Dispatcher"
                  >
                    LOAD
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
