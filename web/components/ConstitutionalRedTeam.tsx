"use client";

import React, { useState, useEffect } from "react";
import {
  getConstitutionalRules,
  generateRedTeamProbes,
  dispatchRun,
  ConstitutionalAxiom,
  RedTeamProbe,
} from "@/lib/api";
import {
  ShieldAlert,
  BookOpen,
  Zap,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Terminal,
  Layers,
  Sparkles,
} from "lucide-react";

export default function ConstitutionalRedTeam({
  onRunDispatched,
}: {
  onRunDispatched?: () => void;
}) {
  const [axioms, setAxioms] = useState<ConstitutionalAxiom[]>([]);
  const [probes, setProbes] = useState<RedTeamProbe[]>([]);
  const [selectedVector, setSelectedVector] = useState<string>("ROLEPLAY_EVASION");
  const [loadingProbes, setLoadingProbes] = useState(false);
  const [dispatchingIndex, setDispatchingIndex] = useState<number | null>(null);
  const [dispatchResults, setDispatchResults] = useState<Record<number, any>>({});

  useEffect(() => {
    loadAxioms();
    handleGenerateProbes("ROLEPLAY_EVASION");
  }, []);

  const loadAxioms = async () => {
    try {
      const data = await getConstitutionalRules();
      setAxioms(data);
    } catch {
      // Fallback
    }
  };

  const handleGenerateProbes = async (vector: string) => {
    setSelectedVector(vector);
    setLoadingProbes(true);
    setDispatchResults({});
    try {
      const data = await generateRedTeamProbes(vector, 3);
      setProbes(data);
    } catch {
      // Fallback
    } finally {
      setLoadingProbes(false);
    }
  };

  const handleExecuteProbe = async (probe: RedTeamProbe, index: number) => {
    setDispatchingIndex(index);
    try {
      const res = await dispatchRun({
        prompt: probe.prompt,
        policy: `CONSTITUTIONAL_POLICY: Enforce ${probe.expected_policy} under zero-trust enclave isolation.`,
        model_id: "llama-3.2-1b-instruct",
        mode: "HARDENED",
        fault_class: probe.target_fault_class,
        experiment_id: `redteam_${Date.now()}`,
      });
      setDispatchResults((prev) => ({ ...prev, [index]: res }));
      if (onRunDispatched) onRunDispatched();
    } catch {
      // Silently catch
    } finally {
      setDispatchingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-hairline-light bg-panel p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-mono text-purple-400">
              <Zap className="h-3.5 w-3.5" />
              <span>ANTHROPIC CONSTITUTIONAL AI & RED-TEAMING</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Constitutional AI Rulebook & Automated Red-Team Campaign
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Formal constitutional principles governing zero-trust AI evaluation. Generate
              adversarial jailbreak vectors, delimiter hijacks, and canary probes to stress-test
              the blinded execution enclave.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Constitutional Axioms Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <BookOpen className="h-4 w-4 text-status-cyan" />
          <span>Active Constitutional Axioms (Hard Gated)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {axioms.map((ax) => (
            <div
              key={ax.id}
              className="rounded-xl border border-hairline bg-card p-4 space-y-2 hover:border-slate-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-status-cyan font-bold">
                  {ax.id}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
                    ax.severity === "CRITICAL"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {ax.severity}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">{ax.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {ax.description}
              </p>
              <div className="pt-2 border-t border-hairline/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Enforcement:</span>
                <span className="text-emerald-400 font-semibold">{ax.enforcement}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Automated Red-Team Campaign Generator */}
      <div className="rounded-2xl border border-hairline-light bg-panel p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-status-warn" />
              <span>Adversarial Campaign Attack Vectors</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select an adversarial vector category to generate novel red-team stress probes:
            </p>
          </div>

          {/* Vector Selector Tabs */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: "ROLEPLAY_EVASION", label: "Roleplay Evasion" },
              { id: "TOKEN_SMUGGLING", label: "Token Smuggling (Base64)" },
              { id: "DELIMITER_HIJACK", label: "Delimiter Hijack" },
              { id: "CANARY_EXFILTRATION", label: "Canary Exfiltration" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => handleGenerateProbes(v.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedVector === v.id
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "bg-card border border-hairline text-slate-400 hover:text-slate-200"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Probes Display */}
        {loadingProbes ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RotateCw className="h-5 w-5 animate-spin text-purple-400" />
            <span>Synthesizing multi-turn adversarial campaign probes...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {probes.map((probe, idx) => {
              const result = dispatchResults[idx];
              const isDispatching = dispatchingIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-hairline bg-card p-4 space-y-3 font-mono text-xs transition-all hover:border-slate-500"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-400" />
                      <span className="font-bold text-slate-200">{probe.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Expected: {probe.expected_policy}</span>
                      <span>•</span>
                      <span className="text-status-cyan">{probe.target_fault_class}</span>
                    </div>
                  </div>

                  {/* Prompt Text */}
                  <div className="rounded-lg bg-canvas-deep p-3 text-slate-300 text-[11px] leading-relaxed border border-hairline/40">
                    {probe.prompt}
                  </div>

                  {/* Execution Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      <span>{probe.enclave_guard_action}</span>
                    </div>

                    <button
                      onClick={() => handleExecuteProbe(probe, idx)}
                      disabled={isDispatching}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 px-4 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/30 active:scale-98 transition-all disabled:opacity-50"
                    >
                      {isDispatching ? (
                        <>
                          <RotateCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Sealing Handshake...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          <span>Dispatch to Blinded Enclave</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Result Receipt if Dispatched */}
                  {result && (
                    <div className="mt-2 rounded-lg border border-status-pass/30 bg-status-pass/5 p-3 text-[11px] space-y-1.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span>ENCLAVE DISPATCH CONFIRMED</span>
                        <span>STATUS: {result.run_data?.status}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                        <div>
                          <span className="text-slate-500">Run ID:</span>{" "}
                          {result.run_data?.run_id}
                        </div>
                        <div>
                          <span className="text-slate-500">Merkle Root:</span>{" "}
                          <span className="text-emerald-400">
                            {result.run_data?.merkle_root?.slice(0, 16)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
