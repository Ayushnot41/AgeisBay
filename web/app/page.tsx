"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TelemetryStats,
  EvaluationRun,
  AblationMatrixRow,
  getTelemetryStats,
  getRuns,
  getAblationMatrix,
  API_BASE
} from "@/lib/api";
import TelemetryRibbon from "@/components/TelemetryRibbon";
import EnclaveTopology from "@/components/EnclaveTopology";
import CommitRevealDispatcher from "@/components/CommitRevealDispatcher";
import PairedMatrixComparator from "@/components/PairedMatrixComparator";
import MerkleTreeVisualizer from "@/components/MerkleTreeVisualizer";
import TopologyDagModal from "@/components/TopologyDagModal";
import TinyFishSentinelCard from "@/components/TinyFishSentinelCard";
import {
  Terminal,
  Database,
  RefreshCw,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock
} from "lucide-react";

export default function SecOpsWorkbench() {
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [matrixData, setMatrixData] = useState<AblationMatrixRow[]>([]);
  const [selectedRun, setSelectedRun] = useState<EvaluationRun | null>(null);
  const [activeFault, setActiveFault] = useState<string>("CLEAN");
  const [isDagModalOpen, setIsDagModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      const [s, r, m] = await Promise.all([
        getTelemetryStats(),
        getRuns(50),
        getAblationMatrix(),
      ]);
      setStats(s);
      setRuns(r);
      setMatrixData(m.matrix);
      if (!selectedRun && r.length > 0) {
        setSelectedRun(r[0]);
      } else if (selectedRun) {
        // Keep updated state for selected run
        const updated = r.find((x) => x.run_id === selectedRun.run_id);
        if (updated) setSelectedRun(updated);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to load SecOps workbench data:", err);
    }
  }, [selectedRun]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Connect to live SSE EventStream for sub-millisecond reactive telemetry
  useEffect(() => {
    const sseUrl = `${API_BASE}/api/stream/events`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(sseUrl);
      eventSource.onopen = () => setIsStreaming(true);
      eventSource.onerror = () => setIsStreaming(false);

      eventSource.addEventListener("run_dispatched", () => {
        loadData();
      });
      eventSource.addEventListener("paired_experiment_completed", () => {
        loadData();
      });
      eventSource.addEventListener("tamper_simulated", () => {
        loadData();
      });
      eventSource.addEventListener("tamper_restored", () => {
        loadData();
      });
    } catch (e) {
      console.warn("SSE connection unestablished, falling back to polling.", e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [loadData]);

  const handleRunCompleted = (newRun: EvaluationRun) => {
    setSelectedRun(newRun);
    loadData();
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans select-none">
      {/* 1. Top Telemetry Ribbon */}
      <TelemetryRibbon
        stats={stats}
        onRefresh={loadData}
        isStreaming={isStreaming}
      />

      {/* 2. TinyFish Web Sentinel & Adversarial Egress Probe */}
      <section className="px-3 pt-3 max-w-[1920px] mx-auto w-full">
        <TinyFishSentinelCard />
      </section>

      {/* 3. Four-Panel Operator Workspace Grid */}
      <main className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-[1920px] mx-auto w-full">
        {/* Left Column: Panel A (Top) + Panel C (Bottom) */}
        <div className="flex flex-col gap-3 h-full">
          {/* Panel A: Enclave Topology & Boundary Monitor */}
          <div className="flex-1 min-h-[300px]">
            <EnclaveTopology
              onOpenDagModal={() => setIsDagModalOpen(true)}
              activeFault={activeFault}
            />
          </div>

          {/* Panel C: Paired Fault Experiment Comparator */}
          <div className="flex-1 min-h-[350px]">
            <PairedMatrixComparator
              matrixData={matrixData}
              onPairedRunComplete={loadData}
            />
          </div>
        </div>

        {/* Right Column: Panel B (Top) + Panel D (Bottom) */}
        <div className="flex flex-col gap-3 h-full">
          {/* Panel B: Two-Sided Commit-Reveal Dispatcher */}
          <div className="flex-1 min-h-[320px]">
            <CommitRevealDispatcher
              onRunCompleted={handleRunCompleted}
              onFaultSelect={setActiveFault}
            />
          </div>

          {/* Panel D: 4-Leaf Merkle Receipt & Ed25519 Inspector */}
          <div className="flex-1 min-h-[350px]">
            <MerkleTreeVisualizer
              runs={runs}
              selectedRun={selectedRun}
              onSelectRun={setSelectedRun}
              onTamperToggled={loadData}
            />
          </div>
        </div>
      </main>

      {/* 3. Bottom Audit Log Live Gutter */}
      <footer className="w-full bg-card border-t border-hairline px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Database className="w-3.5 h-3.5 text-status-cyan" />
            <span>IMMUTABLE SQLITE AUDIT LEDGER:</span>
          </div>
          <span className="text-slate-300">
            {runs.length} RUNS COMMITTED
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            LAST SYNC: {lastRefreshed || "INITIALIZING"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-pass" />
            <span>ELIGIBLE: Contributes to Safety Score</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-fail" />
            <span>INVALID: Integrity/Boundary Failure (0.0)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-warn" />
            <span>INCOMPLETE: Deadline/Trace Overrun (0.0)</span>
          </div>
        </div>
      </footer>

      {/* 4. Graphify Architectural AST DAG Modal */}
      <TopologyDagModal
        isOpen={isDagModalOpen}
        onClose={() => setIsDagModalOpen(false)}
      />
    </div>
  );
}
