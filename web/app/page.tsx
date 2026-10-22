"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { MotionConfig } from "framer-motion";
import {
  TelemetryStats,
  EvaluationRun,
  AblationMatrixRow,
  TinyFishThreat,
  getTelemetryStats,
  getRuns,
  getAblationMatrix,
  API_BASE,
} from "@/lib/api";
import TelemetryRibbon from "@/components/TelemetryRibbon";
import EnclaveTopology from "@/components/EnclaveTopology";
import CommitRevealDispatcher from "@/components/CommitRevealDispatcher";
import PairedMatrixComparator from "@/components/PairedMatrixComparator";
import MerkleTreeVisualizer from "@/components/MerkleTreeVisualizer";
import TopologyDagModal from "@/components/TopologyDagModal";
import TinyFishSentinelCard from "@/components/TinyFishSentinelCard";
import { ErrorNotice, CopyButton } from "@/components/WorkbenchUI";
import { Fingerprint } from "lucide-react";
import "./workbench.css";

export default function SecOpsWorkbench() {
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [matrix, setMatrix] = useState<AblationMatrixRow[]>([]);
  const [selected, setSelected] = useState<EvaluationRun | null>(null);
  const [fault, setFault] = useState("CLEAN");
  const [threat, setThreat] = useState<TinyFishThreat | null>(null);
  const [dagOpen, setDagOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sync, setSync] = useState("");
  const pending = useRef<Promise<void> | null>(null);
  const loadData = useCallback(() => {
    if (pending.current) return pending.current;
    setRefreshing(true);
    const task = (async () => {
      try {
        const [s, r, m] = await Promise.all([
          getTelemetryStats(),
          getRuns(50),
          getAblationMatrix(),
        ]);
        setStats(s);
        setRuns(r);
        setMatrix(m.matrix);
        setSelected((previous) =>
          previous
            ? r.find((item) => item.run_id === previous.run_id) || previous
            : r[0] || null,
        );
        setSync(new Date().toLocaleTimeString());
        setError(null);
      } catch {
        setError(
          "Unable to sync with the mediator. Check the service connection and retry. Previously loaded data may be stale.",
        );
      } finally {
        setRefreshing(false);
        pending.current = null;
      }
    })();
    pending.current = task;
    return task;
  }, []);
  useEffect(() => {
    void loadData();
    const timer = setInterval(() => {
      if (!document.hidden) void loadData();
    }, 5000);
    const source = new EventSource(`${API_BASE}/api/stream/events`);
    source.onopen = () => setStreaming(true);
    source.onerror = () => setStreaming(false);
    [
      "run_dispatched",
      "paired_experiment_completed",
      "tamper_simulated",
      "tamper_restored",
    ].forEach((event) => source.addEventListener(event, () => void loadData()));
    return () => {
      clearInterval(timer);
      source.close();
    };
  }, [loadData]);
  function loadThreat(value: TinyFishThreat) {
    setThreat({ ...value });
    setFault(value.target_enclave_check);
    document.getElementById("dispatcher")?.scrollIntoView({ block: "start" });
    requestAnimationFrame(() =>
      document.getElementById("attack-prompt")?.focus({ preventScroll: true }),
    );
  }
  return (
    <MotionConfig reducedMotion="user">
      <div className="workbench">
        <a href="#workspace" className="skip-link">
          Skip to evaluation workspace
        </a>
        <TelemetryRibbon
          stats={stats}
          onRefresh={loadData}
          isStreaming={streaming}
          refreshing={refreshing}
          stale={!!error}
        />
        <div className="page-intro">
          <div>
            <h1>Evaluation workbench</h1>
            <p>
              Dispatch controlled tests. Compare evidence. Inspect every signed
              receipt.
            </p>
          </div>
          <nav className="workspace-links" aria-label="Workspace sections">
            <a href="#dispatcher">Dispatch</a>
            <a href="#comparison">Compare</a>
            <a href="#receipts">Receipts</a>
            <a href="#sentinel">Sentinel</a>
          </nav>
        </div>
        <ErrorNotice message={error} />
        <main id="workspace" tabIndex={-1}>
          <div className="metrics-strip" aria-label="Evaluation telemetry">
            <div className="metric">
              <div className="metric-label">Committed evaluations</div>
              <div className="metric-value">{stats?.total_runs ?? "—"}</div>
              <div className="metric-note">
                <span className="pass">
                  {stats?.eligible_runs ?? "—"} eligible
                </span>
                <span className="fail">
                  {stats?.invalid_runs ?? "—"} invalid
                </span>
                <span className="warn">
                  {stats?.incomplete_runs ?? "—"} incomplete
                </span>
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">Median release · P50</div>
              <div className="metric-value">
                {stats?.p50_padded_ms?.toLocaleString() ?? "—"}
                <small>ms</small>
              </div>
              <div className="metric-note">Recorded hardened runs</div>
            </div>
            <div className="metric">
              <div className="metric-label">Tail release · P95</div>
              <div className="metric-value">
                {stats?.p95_padded_ms?.toLocaleString() ?? "—"}
                <small>ms</small>
              </div>
              <div className="metric-note">Includes deadline overruns</div>
            </div>
            <div className="metric">
              <div className="metric-label">Execution environment</div>
              <div className="metric-value" style={{ fontSize: 18 }}>
                Synthetic harness
              </div>
              <div className="metric-note">
                Real receipts · simulated isolation
              </div>
            </div>
          </div>
          <div className="workspace-grid">
            <EnclaveTopology
              activeFault={fault}
              selectedRun={selected}
              onOpenDagModal={() => setDagOpen(true)}
            />
            <CommitRevealDispatcher
              threat={threat}
              onFaultSelect={setFault}
              onRunCompleted={(run) => {
                setSelected(run);
                void loadData();
              }}
            />
            <PairedMatrixComparator
              matrixData={matrix}
              onPairedRunComplete={loadData}
            />
            <MerkleTreeVisualizer
              runs={runs}
              selectedRun={selected}
              onSelectRun={setSelected}
              onTamperToggled={loadData}
            />
          </div>
          <div className="sentinel">
            <TinyFishSentinelCard onLoadThreatIntoDispatcher={loadThreat} />
          </div>
        </main>
        <footer className="workspace-footer">
          <span className="fingerprint">
            <Fingerprint size={15} />
            <span>Signing key</span>
            <code>
              {stats?.enclave_public_key_fingerprint || "Awaiting mediator"}
            </code>
            {stats && (
              <CopyButton
                value={stats.enclave_public_key_fingerprint}
                label="Copy signing key fingerprint"
              />
            )}
          </span>
          <span>
            {runs.length} recent receipts · Last sync {sync || "pending"}
          </span>
        </footer>
        <TopologyDagModal isOpen={dagOpen} onClose={() => setDagOpen(false)} />
      </div>
    </MotionConfig>
  );
}
