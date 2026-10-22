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
import EvidenceLedgerView from "@/components/EvidenceLedgerView";
import { ErrorNotice, CopyButton } from "@/components/WorkbenchUI";
import {
  Fingerprint,
  LayoutDashboard,
  Database,
  Radio,
  FlaskConical,
  Network,
} from "lucide-react";
import "./workbench.css";

type TabId = "console" | "ledger" | "sentinel" | "ablation" | "topology";

export default function SecOpsWorkbench() {
  const [activeTab, setActiveTab] = useState<TabId>("console");
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
    setActiveTab("console");
    setTimeout(() => {
      document.getElementById("dispatcher")?.scrollIntoView({ block: "start" });
      requestAnimationFrame(() =>
        document.getElementById("attack-prompt")?.focus({ preventScroll: true }),
      );
    }, 50);
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "console", label: "Operations Console", icon: <LayoutDashboard size={14} /> },
    { id: "ledger", label: "Evidence Ledger (Paging)", icon: <Database size={14} /> },
    { id: "sentinel", label: "TinyFish Sentinel", icon: <Radio size={14} /> },
    { id: "ablation", label: "Paired Ablation Lab", icon: <FlaskConical size={14} /> },
    { id: "topology", label: "Subnet Topology", icon: <Network size={14} /> },
  ];

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
            <h1>AegisBay SecOps Enclave</h1>
            <p>
              Evidence-Gated AI Safety Testing & Blinded Zero-Trust Evaluation Workbench
            </p>
          </div>
          <nav className="workspace-links" aria-label="Workbench views" style={{ gap: "8px", flexWrap: "wrap" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? "rgba(6, 182, 212, 0.14)" : "var(--raised)",
                  color: activeTab === tab.id ? "var(--cyan)" : "var(--muted)",
                  border: activeTab === tab.id ? "1px solid var(--cyan)" : "1px solid var(--border)",
                  borderRadius: "5px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <ErrorNotice message={error} />
        <main id="workspace" tabIndex={-1}>
          {/* Global Key Metrics Ribbon */}
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
              <div className="metric-note">Calibrated constant-time window</div>
            </div>
            <div className="metric">
              <div className="metric-label">Tail release · P95</div>
              <div className="metric-value">
                {stats?.p95_padded_ms?.toLocaleString() ?? "—"}
                <small>ms</small>
              </div>
              <div className="metric-note">Bounded maximum variance</div>
            </div>
            <div className="metric">
              <div className="metric-label">Execution environment</div>
              <div className="metric-value" style={{ fontSize: 18 }}>
                Zero-Trust Enclave
              </div>
              <div className="metric-note">
                RFC 8785 Merkle · Ed25519 Certified
              </div>
            </div>
          </div>

          {/* Tab 1: Operations Console (Unified Dashboard) */}
          {activeTab === "console" && (
            <>
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
              <div className="sentinel" style={{ marginTop: "24px" }}>
                <TinyFishSentinelCard onLoadThreatIntoDispatcher={loadThreat} />
              </div>
            </>
          )}

          {/* Tab 2: Evidence Ledger & Merkle Proof Explorer (Paginated Data Grid) */}
          {activeTab === "ledger" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <EvidenceLedgerView
                selectedRun={selected}
                onSelectRun={setSelected}
                onTamperToggled={loadData}
              />
              <MerkleTreeVisualizer
                runs={runs}
                selectedRun={selected}
                onSelectRun={setSelected}
                onTamperToggled={loadData}
              />
            </div>
          )}

          {/* Tab 3: TinyFish Autonomous Sentinel Center */}
          {activeTab === "sentinel" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <TinyFishSentinelCard onLoadThreatIntoDispatcher={loadThreat} />
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
              </div>
            </div>
          )}

          {/* Tab 4: Paired Ablation Laboratory */}
          {activeTab === "ablation" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <PairedMatrixComparator
                matrixData={matrix}
                onPairedRunComplete={loadData}
              />
              <div className="workspace-grid">
                <CommitRevealDispatcher
                  threat={threat}
                  onFaultSelect={setFault}
                  onRunCompleted={(run) => {
                    setSelected(run);
                    void loadData();
                  }}
                />
                <MerkleTreeVisualizer
                  runs={runs}
                  selectedRun={selected}
                  onSelectRun={setSelected}
                  onTamperToggled={loadData}
                />
              </div>
            </div>
          )}

          {/* Tab 5: Subnet Topology & Architecture */}
          {activeTab === "topology" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <EnclaveTopology
                activeFault={fault}
                selectedRun={selected}
                onOpenDagModal={() => setDagOpen(true)}
              />
              <div className="workspace-grid">
                <MerkleTreeVisualizer
                  runs={runs}
                  selectedRun={selected}
                  onSelectRun={setSelected}
                  onTamperToggled={loadData}
                />
                <TinyFishSentinelCard onLoadThreatIntoDispatcher={loadThreat} />
              </div>
            </div>
          )}
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
