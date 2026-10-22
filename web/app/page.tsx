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
import { useAuth } from "@/lib/auth";
import TelemetryRibbon from "@/components/TelemetryRibbon";
import EnclaveTopology from "@/components/EnclaveTopology";
import CommitRevealDispatcher from "@/components/CommitRevealDispatcher";
import PairedMatrixComparator from "@/components/PairedMatrixComparator";
import MerkleTreeVisualizer from "@/components/MerkleTreeVisualizer";
import TopologyDagModal from "@/components/TopologyDagModal";
import TinyFishSentinelCard from "@/components/TinyFishSentinelCard";
import EvidenceLedgerView from "@/components/EvidenceLedgerView";
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import { ErrorNotice, CopyButton } from "@/components/WorkbenchUI";
import {
  Fingerprint,
  LayoutDashboard,
  Database,
  Radio,
  FlaskConical,
  Network,
  ArrowLeft,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Lock,
} from "lucide-react";
import "./workbench.css";

type TabId = "console" | "ledger" | "sentinel" | "ablation" | "topology";
type ViewMode = "landing" | "workbench";

export default function SecOpsWorkbench() {
  const { user, isAuthenticated, logout } = useAuth();
  const [view, setView] = useState<ViewMode>("landing");
  const [authModalOpen, setAuthModalOpen] = useState(false);
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

  const loadThreat = useCallback((detected: TinyFishThreat) => {
    setThreat(detected);
    const matched =
      detected.recommended_fault_class &&
      [
        "CLEAN",
        "FAULT_01_NET_EGRESS",
        "FAULT_02_PRETEST_PEEK",
        "FAULT_03_POLICY_DRIFT",
        "FAULT_04_KV_CANARY_BLEED",
        "FAULT_05_DEADLINE_OVERRUN",
        "FAULT_06_TELEMETRY_DROP",
      ].includes(detected.recommended_fault_class)
        ? detected.recommended_fault_class
        : "FAULT_01_NET_EGRESS";
    setFault(matched);
  }, []);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "console", label: "Operations Console", icon: <LayoutDashboard size={14} /> },
    { id: "ledger", label: "Evidence Ledger", icon: <Database size={14} /> },
    { id: "sentinel", label: "Sentinel Defense", icon: <Radio size={14} /> },
    { id: "ablation", label: "Paired Ablation Lab", icon: <FlaskConical size={14} /> },
    { id: "topology", label: "Subnet Topology", icon: <Network size={14} /> },
  ];

  // If viewing landing page, render LandingPage component
  if (view === "landing") {
    return (
      <MotionConfig reducedMotion="user">
        <LandingPage
          stats={stats}
          onLaunchConsole={() => setView("workbench")}
          onOpenLedger={() => {
            setView("workbench");
            setActiveTab("ledger");
          }}
          onOpenAblation={() => {
            setView("workbench");
            setActiveTab("ablation");
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="workbench">
        <a href="#workspace" className="skip-link">
          Skip to evaluation workspace
        </a>

        {/* Global Navigation Bar for Workbench */}
        <div className="flex items-center justify-between border-b border-hairline bg-canvas-deep px-4 py-2.5 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("landing")}
              className="flex items-center gap-1.5 rounded-lg border border-hairline-light bg-card px-2.5 py-1 text-slate-300 hover:text-status-cyan hover:border-status-cyan/50 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Landing Page</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <span className="text-slate-600">•</span>
              <ShieldCheck className="h-3.5 w-3.5 text-status-cyan" />
              <span>ENCLAVE WORKBENCH ACTIVE</span>
            </div>
          </div>

          {/* User Auth Info in Workbench Header */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 rounded-lg border border-hairline bg-card px-2.5 py-1">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-4 w-4 rounded-full border border-status-cyan/40 object-cover"
                  />
                ) : (
                  <UserIcon className="h-3.5 w-3.5 text-status-cyan" />
                )}
                <span className="font-medium text-slate-200">{user.name.split(" ")[0]}</span>
                <span className="rounded bg-status-cyan/10 border border-status-cyan/30 px-1.5 py-0.2 text-[9px] font-mono text-status-cyan uppercase">
                  {user.role}
                </span>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-red-400 transition-colors ml-1"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-status-cyan/40 bg-status-cyan/10 px-2.5 py-1 text-[11px] font-medium text-status-cyan hover:bg-status-cyan/20 transition-all"
              >
                <Lock className="h-3 w-3" />
                <span>Auditor Sign In</span>
              </button>
            )}
          </div>
        </div>

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
              <CommitRevealDispatcher
                onRunComplete={loadData}
                initialFaultClass={fault}
                injectedThreat={threat}
              />
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
            </>
          )}

          {/* Tab 2: Evidence Ledger */}
          {activeTab === "ledger" && (
            <EvidenceLedgerView
              runs={runs}
              selectedRun={selected}
              onSelectRun={setSelected}
              onTamperToggled={loadData}
            />
          )}

          {/* Tab 3: Sentinel Defense */}
          {activeTab === "sentinel" && (
            <div className="workspace-column">
              <TinyFishSentinelCard onLoadThreatIntoDispatcher={loadThreat} />
              <EnclaveTopology
                activeFault={fault}
                selectedRun={selected}
                onOpenDagModal={() => setDagOpen(true)}
              />
            </div>
          )}

          {/* Tab 4: Paired Ablation Lab */}
          {activeTab === "ablation" && (
            <div className="workspace-column">
              <PairedMatrixComparator matrix={matrix} onTriggerComplete={loadData} />
            </div>
          )}

          {/* Tab 5: Subnet Topology */}
          {activeTab === "topology" && (
            <div className="workspace-column">
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
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    </MotionConfig>
  );
}
