"use strict";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EvaluationRun, simulateTamper, restoreTamper } from "@/lib/api";
import {
  GitCommit,
  ShieldCheck,
  AlertOctagon,
  Copy,
  Check,
  RefreshCw,
  Eye,
  FileCode,
  Flame,
  Undo2,
  Lock
} from "lucide-react";

interface Props {
  runs: EvaluationRun[];
  selectedRun: EvaluationRun | null;
  onSelectRun: (run: EvaluationRun) => void;
  onTamperToggled: () => void;
}

export default function MerkleTreeVisualizer({
  runs,
  selectedRun,
  onSelectRun,
  onTamperToggled,
}: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLeafDetail, setActiveLeafDetail] = useState<string | null>(null);
  const [isTampering, setIsTampering] = useState(false);

  const run = selectedRun || runs[0] || null;
  const isTampered = run?.is_tampered === 1;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateTamper = async () => {
    if (!run) return;
    setIsTampering(true);
    try {
      await simulateTamper(run.run_id);
      onTamperToggled();
    } catch (err) {
      console.error("Tamper simulation failed:", err);
    } finally {
      setIsTampering(false);
    }
  };

  const handleRestoreTamper = async () => {
    if (!run) return;
    setIsTampering(true);
    try {
      await restoreTamper(run.run_id);
      onTamperToggled();
    } catch (err) {
      console.error("Restore failed:", err);
    } finally {
      setIsTampering(false);
    }
  };

  if (!run) {
    return (
      <div className="card-elevated rounded-lg p-3.5 flex items-center justify-center h-full text-slate-500 font-mono text-xs">
        NO EVALUATION RUNS COMMITTED TO LEDGER YET
      </div>
    );
  }

  return (
    <div className="card-elevated rounded-lg p-3.5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-hairline">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-status-cyan" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
            PANEL D: 4-LEAF MERKLE RECEIPT &amp; ED25519 INSPECTOR
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={run.run_id}
            onChange={(e) => {
              const found = runs.find((r) => r.run_id === e.target.value);
              if (found) onSelectRun(found);
            }}
            className="bg-panel border border-hairline rounded px-2 py-0.5 text-[11px] font-mono text-slate-200 outline-none focus:border-status-cyan"
          >
            {runs.map((r) => (
              <option key={r.run_id} value={r.run_id}>
                {r.run_id} ({r.fault_class} - {r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interactive Tree Container */}
      <div className="telemetry-well rounded-md p-3 flex-1 flex flex-col justify-between overflow-y-auto min-h-[260px]">
        {/* Tamper Warning Banner if 1-bit mutation active */}
        <AnimatePresence>
          {isTampered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-2 p-2 rounded bg-red-950/80 border border-red-600 text-red-200 text-[11px] font-mono flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-status-fail animate-pulse" />
                <div>
                  <span className="font-bold">1-BIT SQLITE TAMPER ACTIVE:</span> Result record
                  mutated. Leaf 3 hash failed recomputation!
                </div>
              </div>
              <button
                onClick={handleRestoreTamper}
                disabled={isTampering}
                className="px-2 py-0.5 rounded bg-panel hover:bg-panel-hover text-status-pass border border-hairline font-bold flex items-center gap-1"
              >
                <Undo2 className="w-3 h-3" /> RESTORE
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Merkle Root + Ed25519 Signature Node */}
        <div className="flex flex-col items-center">
          <div
            className={`w-full max-w-md p-2 rounded border text-center transition-all ${
              isTampered
                ? "bg-red-950/40 border-red-500 shadow-glowFail"
                : "bg-cyan-950/30 border-status-cyan shadow-glowCyan"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-bold text-slate-200">
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${
                    isTampered ? "text-status-fail" : "text-status-pass"
                  }`}
                />
                MERKLE ROOT (ED25519 ATTESTED)
              </span>
              <span
                className={`font-bold ${
                  isTampered ? "text-status-fail" : "text-status-pass"
                }`}
              >
                {isTampered ? "SIGNATURE INVALID" : "VALID ENCLAVE SIG"}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-200 truncate select-all">
              {run.merkle_root}
            </div>
            <div className="mt-1 pt-1 border-t border-hairline/60 flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span className="truncate max-w-[280px]">SIG: {run.ed25519_signature}</span>
              <button
                onClick={() => copyText(run.merkle_root, "root")}
                className="hover:text-slate-200"
              >
                {copiedKey === "root" ? (
                  <Check className="w-3 h-3 text-status-pass" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Tree Trunk SVG Connectors */}
          <svg className="w-48 h-5 my-0.5" viewBox="0 0 200 20">
            <line x1="100" y1="0" x2="50" y2="20" stroke="#1E293B" strokeWidth="1.5" />
            <line
              x1="100"
              y1="0"
              x2="150"
              y2="20"
              stroke={isTampered ? "#EF4444" : "#1E293B"}
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* 2. Branch Pair Nodes */}
        <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto w-full my-1">
          {/* Branch A (L1 + L2) */}
          <div className="bg-panel p-2 rounded border border-hairline text-[10px] font-mono">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="font-semibold text-status-cyan">BRANCH A (L1 + L2)</span>
              <span className="text-status-pass">PASS</span>
            </div>
            <div className="text-slate-300 truncate text-[10px]">{run.branch_a}</div>
          </div>

          {/* Branch B (L3 + L4) */}
          <div
            className={`p-2 rounded border text-[10px] font-mono transition-all ${
              isTampered
                ? "bg-red-950/40 border-red-500 text-red-200"
                : "bg-panel border-hairline text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span
                className={`font-semibold ${
                  isTampered ? "text-status-fail" : "text-status-cyan"
                }`}
              >
                BRANCH B (L3 + L4)
              </span>
              <span className={isTampered ? "text-status-fail font-bold" : "text-status-pass"}>
                {isTampered ? "BROKEN" : "PASS"}
              </span>
            </div>
            <div className="truncate text-[10px]">{run.branch_b}</div>
          </div>
        </div>

        {/* Tree Branch SVG Connectors */}
        <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto w-full">
          <svg className="w-full h-4" viewBox="0 0 200 16">
            <line x1="100" y1="0" x2="35" y2="16" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="100" y1="0" x2="165" y2="16" stroke="#1E293B" strokeWidth="1.5" />
          </svg>
          <svg className="w-full h-4" viewBox="0 0 200 16">
            <line
              x1="100"
              y1="0"
              x2="35"
              y2="16"
              stroke={isTampered ? "#EF4444" : "#1E293B"}
              strokeWidth="1.5"
            />
            <line x1="100" y1="0" x2="165" y2="16" stroke="#1E293B" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 3. The 4 Merkle Leaves */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
          {/* Leaf 1: Config */}
          <div
            onClick={() => setActiveLeafDetail(activeLeafDetail === "config" ? null : "config")}
            className="p-2 rounded bg-card hover:bg-card-elevated border border-hairline cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="font-bold text-slate-200">LEAF 1: CONFIG</span>
              <span className="text-status-pass">PASS</span>
            </div>
            <div className="text-slate-400 truncate">{run.leaf_01_config}</div>
            <div className="mt-1 text-[9px] text-slate-500">Run ID + Commitments</div>
          </div>

          {/* Leaf 2: Checks */}
          <div
            onClick={() => setActiveLeafDetail(activeLeafDetail === "checks" ? null : "checks")}
            className="p-2 rounded bg-card hover:bg-card-elevated border border-hairline cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="font-bold text-slate-200">LEAF 2: CHECKS</span>
              <span className="text-status-pass">PASS</span>
            </div>
            <div className="text-slate-400 truncate">{run.leaf_02_checks}</div>
            <div className="mt-1 text-[9px] text-slate-500">6 Isolation Checks</div>
          </div>

          {/* Leaf 3: Result (Tamper Target) */}
          <div
            onClick={() => setActiveLeafDetail(activeLeafDetail === "result" ? null : "result")}
            className={`p-2 rounded border cursor-pointer transition-all ${
              isTampered
                ? "bg-red-950/60 border-red-500 text-red-200 shadow-glowFail animate-pulse"
                : "bg-card hover:bg-card-elevated border-hairline text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-bold">LEAF 3: RESULT</span>
              <span className={isTampered ? "text-status-fail font-bold" : "text-status-pass"}>
                {isTampered ? "FAIL" : "PASS"}
              </span>
            </div>
            <div className="truncate text-slate-400">{run.leaf_03_result}</div>
            <div className="mt-1 text-[9px] text-slate-500">Safety Score + Latency</div>
          </div>

          {/* Leaf 4: Status */}
          <div
            onClick={() => setActiveLeafDetail(activeLeafDetail === "status" ? null : "status")}
            className="p-2 rounded bg-card hover:bg-card-elevated border border-hairline cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="font-bold text-slate-200">LEAF 4: STATUS</span>
              <span className="text-status-pass">PASS</span>
            </div>
            <div className="text-slate-400 truncate">{run.leaf_04_status}</div>
            <div className="mt-1 text-[9px] text-slate-500">State + Gated Score</div>
          </div>
        </div>

        {/* Selected Leaf Canonical JSON Drawer */}
        <AnimatePresence>
          {activeLeafDetail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2.5 rounded bg-panel border border-hairline text-[10px] font-mono text-slate-300"
            >
              <div className="flex items-center justify-between mb-1 text-slate-400 font-bold">
                <span className="flex items-center gap-1 text-status-cyan">
                  <FileCode className="w-3 h-3" /> CANONICAL PRE-IMAGE: {activeLeafDetail.toUpperCase()}
                </span>
                <button
                  onClick={() => setActiveLeafDetail(null)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  CLOSE
                </button>
              </div>
              <pre className="overflow-x-auto text-slate-300 bg-black/40 p-2 rounded max-h-24">
                {JSON.stringify(run.raw_records?.[activeLeafDetail] || {}, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Tamper Action Controls */}
        <div className="pt-2 mt-2 border-t border-hairline/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div className="text-slate-400">
            AUDIT TRAIL: <span className="text-slate-200">{run.created_at}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isTampered ? (
              <button
                onClick={handleSimulateTamper}
                disabled={isTampering}
                className="px-2.5 py-1 rounded text-red-300 bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 font-bold flex items-center gap-1.5 transition-colors active:scale-95"
              >
                <Flame className="w-3.5 h-3.5 text-status-fail" />
                <span>SIMULATE 1-BIT SQLITE TAMPER</span>
              </button>
            ) : (
              <button
                onClick={handleRestoreTamper}
                disabled={isTampering}
                className="px-2.5 py-1 rounded text-status-pass bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-800/60 font-bold flex items-center gap-1.5 transition-colors active:scale-95 shadow-glowPass"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>RESTORE AUTHENTIC CRYPTOGRAPHIC STATE</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
