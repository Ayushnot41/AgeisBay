"use client";

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
  Lock,
  Binary,
  Layers,
  ChevronDown
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
    <div className="card-elevated rounded-lg p-3.5 flex flex-col h-full border border-[#1E2A3C] bg-[#0B0F17]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-cyan-400" />
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
            className="bg-[#07090E] border border-[#1E293B] rounded px-2 py-0.5 text-[10px] font-mono text-slate-200 outline-none focus:border-cyan-400"
          >
            {runs.map((r) => (
              <option key={r.run_id} value={r.run_id}>
                {r.run_id} ({r.fault_class} - {r.status})
              </option>
            ))}
          </select>

          {isTampered ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 text-red-300 border border-red-500 flex items-center gap-1 animate-pulse">
              <AlertOctagon className="w-3 h-3 text-red-400" />
              TAMPER DETECTED
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              AUTHENTIC
            </span>
          )}
        </div>
      </div>

      {/* Merkle Tree DAG Container */}
      <div className="telemetry-well rounded p-2.5 flex-1 flex flex-col justify-between overflow-y-auto max-h-[300px]">
        {/* Tier 1: Merkle Root & Ed25519 Signature */}
        <div className="flex flex-col gap-1.5 p-2 rounded bg-black/40 border border-[#1E293B]">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              MERKLE ROOT HASH
            </span>
            <button
              onClick={() => copyText(run.merkle_root, "root")}
              className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copiedKey === "root" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === "root" ? "COPIED" : "COPY HASH"}</span>
            </button>
          </div>
          <div className="font-mono text-[10px] text-slate-200 break-all select-all bg-[#07090E] p-1.5 rounded border border-[#1E293B]">
            {run.merkle_root}
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-[#1E293B]/60">
            <span className="truncate">
              ED25519 SIGNATURE: <span className="text-slate-300 font-mono">{run.ed25519_signature?.substring(0, 32)}...</span>
            </span>
            <button
              onClick={() => copyText(run.ed25519_signature, "sig")}
              className="text-cyan-400 hover:text-cyan-300 ml-2"
            >
              {copiedKey === "sig" ? "COPIED" : "COPY SIG"}
            </button>
          </div>
        </div>

        {/* Tree Connector Arrows */}
        <div className="flex justify-around text-slate-600 text-[10px] py-1">
          <span>▲ BRANCH A</span>
          <span>▲ BRANCH B</span>
        </div>

        {/* Tier 2: Intermediate Branches A and B */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="p-1.5 rounded bg-black/30 border border-[#1E293B]">
            <div className="text-slate-400 text-[9px] mb-0.5">BRANCH A (LEAF 01 + 02)</div>
            <div className="text-slate-300 truncate select-all">{run.branch_a}</div>
          </div>
          <div className="p-1.5 rounded bg-black/30 border border-[#1E293B]">
            <div className="text-slate-400 text-[9px] mb-0.5">BRANCH B (LEAF 03 + 04)</div>
            <div className="text-slate-300 truncate select-all">{run.branch_b}</div>
          </div>
        </div>

        {/* Tree Connector Arrows */}
        <div className="flex justify-around text-slate-600 text-[10px] py-1">
          <span>▲ CONFIG</span>
          <span>▲ CHECKS</span>
          <span>▲ RESULT</span>
          <span>▲ STATUS</span>
        </div>

        {/* Tier 3: 4 Cryptographic Leaves */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono">
          {/* Leaf 01: Config */}
          <div
            onClick={() => setActiveLeafDetail("config")}
            className="p-1.5 rounded bg-black/40 border border-[#1E293B] hover:border-cyan-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
              <span>LEAF 01: CONFIG</span>
              <Eye className="w-2.5 h-2.5 text-cyan-400" />
            </div>
            <div className="text-slate-300 truncate">{run.leaf_01_config}</div>
          </div>

          {/* Leaf 02: Checks */}
          <div
            onClick={() => setActiveLeafDetail("checks")}
            className={`p-1.5 rounded border cursor-pointer transition-all ${
              isTampered
                ? "bg-red-950/40 border-red-500 text-red-200"
                : "bg-black/40 border-[#1E293B] hover:border-cyan-500/50"
            }`}
          >
            <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
              <span>LEAF 02: CHECKS</span>
              <Eye className="w-2.5 h-2.5 text-cyan-400" />
            </div>
            <div className="text-slate-300 truncate">{run.leaf_02_checks}</div>
          </div>

          {/* Leaf 03: Result */}
          <div
            onClick={() => setActiveLeafDetail("result")}
            className="p-1.5 rounded bg-black/40 border border-[#1E293B] hover:border-cyan-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
              <span>LEAF 03: RESULT</span>
              <Eye className="w-2.5 h-2.5 text-cyan-400" />
            </div>
            <div className="text-slate-300 truncate">{run.leaf_03_result}</div>
          </div>

          {/* Leaf 04: Status */}
          <div
            onClick={() => setActiveLeafDetail("status")}
            className="p-1.5 rounded bg-black/40 border border-[#1E293B] hover:border-cyan-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
              <span>LEAF 04: STATUS</span>
              <Eye className="w-2.5 h-2.5 text-cyan-400" />
            </div>
            <div className="text-slate-300 truncate">{run.leaf_04_status}</div>
          </div>
        </div>

        {/* Leaf Inspection Pre-image Modal Drawer */}
        <AnimatePresence>
          {activeLeafDetail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2 rounded bg-[#070A10] border border-cyan-500/40 text-[10px] font-mono"
            >
              <div className="flex items-center justify-between text-cyan-400 pb-1 mb-1 border-b border-[#1E293B]">
                <span className="flex items-center gap-1 font-bold">
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
                {JSON.stringify((run.raw_records as Record<string, any>)?.[activeLeafDetail] || {}, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Tamper Action Controls */}
        <div className="pt-2 mt-2 border-t border-[#1E293B]/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
          <div className="text-slate-400">
            RECORDED: <span className="text-slate-200">{run.created_at}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isTampered ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleRestoreTamper}
                disabled={isTampering}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              >
                <Undo2 className="w-3 h-3" />
                <span>RESTORE CRYPTOGRAPHIC INTEGRITY</span>
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSimulateTamper}
                disabled={isTampering}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/60 font-bold transition-all"
              >
                <Flame className="w-3 h-3 text-red-400" />
                <span>SIMULATE 1-BIT SQLITE TAMPER</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
