"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MotionConfig } from "framer-motion";
import {
  AblationMatrixRow,
  API_BASE,
  EvaluationRun,
  TelemetryStats,
  TinyFishThreat,
  getAblationMatrix,
  getRuns,
  getTelemetryStats,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import CommitRevealDispatcher, {
  faultOptions,
} from "@/components/CommitRevealDispatcher";
import TopologyDagModal from "@/components/TopologyDagModal";
import TinyFishSentinelCard from "@/components/TinyFishSentinelCard";
import EvidenceLedgerView from "@/components/EvidenceLedgerView";
import SealLeaderboard from "@/components/SealLeaderboard";
import ConstitutionalRedTeam from "@/components/ConstitutionalRedTeam";
import LakeraGuardShield from "@/components/LakeraGuardShield";
import EnclaveTopology from "@/components/EnclaveTopology";
import PairedMatrixComparator from "@/components/PairedMatrixComparator";
import AuthModal from "@/components/AuthModal";
import { CopyButton, ErrorNotice, Panel, Status } from "@/components/WorkbenchUI";
import {
  Database,
  FlaskConical,
  Fingerprint,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  User as UserIcon,
  X,
  Zap,
} from "lucide-react";
import "./workbench.css";

type TabId =
  | "console"
  | "leaderboard"
  | "redteam"
  | "guard"
  | "ledger"
  | "sentinel"
  | "ablation"
  | "topology";

function faultLabel(faultClass: string) {
  return (
    faultOptions.find(([id]) => id === faultClass)?.[1] ??
    faultClass.replaceAll("_", " ")
  );
}

function RecentRunsCard({
  runs,
  onOpenLedger,
  onSelectRun,
}: {
  runs: EvaluationRun[];
  onOpenLedger: () => void;
  onSelectRun: (run: EvaluationRun) => void;
}) {
  return (
    <Panel
      title="Recent runs"
      description="Latest signed evaluation receipts."
      action={
        <button className="text-action" onClick={onOpenLedger}>
          All receipts <span aria-hidden="true">→</span>
        </button>
      }
    >
      {runs.length ? (
        <div className="recent-run-list">
          {runs.slice(0, 4).map((run) => (
            <button
              className="recent-run-row"
              key={run.run_id}
              onClick={() => onSelectRun(run)}
              aria-label={`Open ${faultLabel(run.fault_class)} receipt, status ${run.status}`}
            >
              <span className="recent-run-mark" aria-hidden="true">
                <img
                  src="/aegisbay/run-status-mark.svg"
                  alt=""
                  width={7}
                  height={7}
                />
              </span>
              <span className="recent-run-copy">
                <span className="recent-run-title">
                  {faultLabel(run.fault_class)}
                </span>
                <code>{run.run_id}</code>
              </span>
              <Status value={run.status} />
              <span className="recent-run-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="recent-runs-empty">
          <strong>No evaluations yet</strong>
          <span>Your signed receipts will appear here after a run.</span>
        </div>
      )}
      <div className="receipt-note">
        <strong>Receipt verification</strong>
        <span>
          Each run includes a Merkle proof and an Ed25519 signature.
        </span>
      </div>
    </Panel>
  );
}

export default function SecOpsWorkbench() {
  const { user, isAuthenticated, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("console");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        const [nextStats, nextRuns, nextMatrix] = await Promise.all([
          getTelemetryStats(),
          getRuns(50),
          getAblationMatrix(),
        ]);
        setStats(nextStats);
        setRuns(nextRuns);
        setMatrix(nextMatrix.matrix);
        setSelected((previous) =>
          previous
            ? nextRuns.find((item) => item.run_id === previous.run_id) || previous
            : nextRuns[0] || null,
        );
        setSync(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
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
    const knownFaults = [
      "CLEAN",
      "FAULT_01_NET_EGRESS",
      "FAULT_02_PRETEST_PEEK",
      "FAULT_03_POLICY_DRIFT",
      "FAULT_04_KV_CANARY_BLEED",
      "FAULT_05_DEADLINE_OVERRUN",
      "FAULT_06_TELEMETRY_DROP",
    ];
    setFault(
      detected.recommended_fault_class &&
        knownFaults.includes(detected.recommended_fault_class)
        ? detected.recommended_fault_class
        : "FAULT_01_NET_EGRESS",
    );
  }, []);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "console", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { id: "ledger", label: "Evidence ledger", icon: <Database size={16} /> },
    { id: "ablation", label: "Paired experiments", icon: <FlaskConical size={16} /> },
    { id: "redteam", label: "Red-team probes", icon: <Zap size={16} /> },
    { id: "guard", label: "Policy guard", icon: <ShieldAlert size={16} /> },
    { id: "sentinel", label: "Network sentinel", icon: <Radio size={16} /> },
    { id: "topology", label: "Topology", icon: <Network size={16} /> },
    { id: "leaderboard", label: "Model leaderboard", icon: <Trophy size={16} /> },
  ];
  const selectedTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const pageTitle = activeTab === "console" ? "Evaluation workspace" : selectedTab.label;
  const pageDescription =
    activeTab === "console"
      ? "Configure a controlled test and review its signed receipt."
      : activeTab === "ledger"
        ? "Review evaluation results and signed evidence."
        : activeTab === "ablation"
          ? "Compare the same fault scenarios across baseline and hardened runs."
          : "Explore the tools and evidence connected to your evaluation workspace.";
  const connectionLabel = error
    ? "Connection interrupted"
    : streaming
      ? "Live updates"
      : stats
        ? "Connected"
        : "Connecting";

  function selectTab(id: TabId) {
    setActiveTab(id);
    setSidebarOpen(false);
    requestAnimationFrame(() => {
      document.getElementById("workspace")?.focus({ preventScroll: true });
    });
  }

  function openSelectedRun(run: EvaluationRun) {
    setSelected(run);
    selectTab("ledger");
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="aegis-app">
        <a href="#workspace" className="skip-link">
          Skip to workspace
        </a>

        <aside
          className={`aegis-sidebar${sidebarOpen ? " is-open" : ""}`}
          aria-label="AegisBay navigation"
        >
          <button className="aegis-brand" onClick={() => selectTab("console")}>
            <span className="aegis-brand-mark">A</span>
            <span className="aegis-brand-copy">
              <strong>AegisBay</strong>
              <small>AI safety workspace</small>
            </span>
          </button>

          <nav className="aegis-navigation">
            <p className="aegis-nav-label">Workspace</p>
            {tabs.slice(0, 3).map((tab) => (
              <button
                key={tab.id}
                className={`aegis-nav-item${activeTab === tab.id ? " is-active" : ""}`}
                aria-current={activeTab === tab.id ? "page" : undefined}
                onClick={() => selectTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
            <p className="aegis-nav-label aegis-nav-label-tools">Research tools</p>
            {tabs.slice(3).map((tab) => (
              <button
                key={tab.id}
                className={`aegis-nav-item${activeTab === tab.id ? " is-active" : ""}`}
                aria-current={activeTab === tab.id ? "page" : undefined}
                onClick={() => selectTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="aegis-sidebar-status">
            <span className={`connection-dot${error ? " is-offline" : ""}`}>
              <img
                src="/aegisbay/connection-indicator.svg"
                alt=""
                width={7}
                height={7}
              />
            </span>
            <span className="sidebar-status-copy">
              <strong>{error ? "Mediator offline" : "Mediator connected"}</strong>
              <small>Simulated worker</small>
            </span>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            className="aegis-sidebar-scrim"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="aegis-main">
          <header className="aegis-topbar">
            <div className="aegis-topbar-left">
              <button
                className="aegis-mobile-menu"
                onClick={() => setSidebarOpen((open) => !open)}
                aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <span className="aegis-breadcrumb">
                <span>AEGISBAY</span>
                <span aria-hidden="true">/</span>
                <strong>{selectedTab.label}</strong>
              </span>
            </div>

            <div className="aegis-topbar-actions">
              <div className={`aegis-connection${error ? " is-offline" : ""}`} role="status">
                <img
                  src="/aegisbay/connection-indicator.svg"
                  alt=""
                  width={7}
                  height={7}
                />
                <span>{connectionLabel}</span>
                <small>{sync ? `Synced ${sync}` : ""}</small>
              </div>
              <button
                className="button aegis-refresh"
                onClick={() => void loadData()}
                disabled={refreshing}
                aria-label="Refresh workspace data"
              >
                <RefreshCw size={15} className={refreshing ? "spin" : ""} />
                <span>Refresh</span>
              </button>
              {isAuthenticated && user ? (
                <div className="aegis-account">
                  <span className="aegis-account-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" width={28} height={28} />
                    ) : (
                      <UserIcon size={15} />
                    )}
                  </span>
                  <span className="aegis-account-name">{user.name.split(" ")[0]}</span>
                  <button
                    className="aegis-account-logout"
                    onClick={logout}
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button className="text-action aegis-sign-in" onClick={() => setAuthModalOpen(true)}>
                  <UserIcon size={15} />
                  <span>Sign in</span>
                </button>
              )}
            </div>
          </header>

          <main id="workspace" className="aegis-workspace" tabIndex={-1}>
            <div className="aegis-page-heading">
              <div>
                <h1>{pageTitle}</h1>
                <p>{pageDescription}</p>
              </div>
              {activeTab !== "console" && (
                <button className="button button-primary" onClick={() => selectTab("console")}>
                  <ShieldCheck size={15} />
                  New evaluation
                </button>
              )}
            </div>

            <div className="aegis-disclosure" role="note">
              <span className="aegis-disclosure-icon">
                <ShieldAlert size={15} />
              </span>
              <span>
                <strong>Synthetic execution</strong>
                <small>
                  Workers simulate tests and checks. Results demonstrate the audit flow, not model behavior.
                </small>
              </span>
            </div>

            <div className="aegis-ledger-summary">
              <span className="ledger-summary-count">
                {stats ? `${stats.total_runs} signed receipts` : "Loading receipts"}
              </span>
              <img src="/aegisbay/divider.svg" alt="" width={4} height={4} />
              <span className="ledger-summary-state">
                {stats?.ledger_verification === "VERIFIED"
                  ? "Ledger verified"
                  : stats?.ledger_verification === "TAMPER_DETECTED"
                    ? "Tampering detected"
                    : stats?.ledger_verification === "EMPTY"
                      ? "Ledger empty"
                      : "Checking ledger"}
              </span>
              {activeTab !== "ledger" && (
                <button className="ledger-summary-link" onClick={() => selectTab("ledger")}>
                  Inspect receipts <span aria-hidden="true">→</span>
                </button>
              )}
            </div>

            <ErrorNotice message={error} />

            {activeTab === "console" && (
              <div className="aegis-dashboard-grid">
                <CommitRevealDispatcher
                  onRunCompleted={(run) => {
                    setSelected(run);
                    void loadData();
                  }}
                  onFaultSelect={setFault}
                  threat={threat}
                />
                <RecentRunsCard
                  runs={runs}
                  onOpenLedger={() => selectTab("ledger")}
                  onSelectRun={openSelectedRun}
                />
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div className="workspace-column"><SealLeaderboard /></div>
            )}
            {activeTab === "redteam" && (
              <div className="workspace-column">
                <ConstitutionalRedTeam onRunDispatched={loadData} />
              </div>
            )}
            {activeTab === "guard" && (
              <div className="workspace-column">
                <LakeraGuardShield onRunDispatched={loadData} />
              </div>
            )}
            {activeTab === "ledger" && (
              <EvidenceLedgerView
                runs={runs}
                selectedRun={selected}
                onSelectRun={setSelected}
                onTamperToggled={loadData}
              />
            )}
            {activeTab === "sentinel" && (
              <div className="workspace-column">
                <TinyFishSentinelCard onLoadThreatIntoDispatcher={loadThreat} />
              </div>
            )}
            {activeTab === "ablation" && (
              <div className="workspace-column">
                <PairedMatrixComparator matrix={matrix} onTriggerComplete={loadData} />
              </div>
            )}
            {activeTab === "topology" && (
              <div className="workspace-column">
                <EnclaveTopology
                  activeFault={fault}
                  selectedRun={selected}
                  onOpenDagModal={() => setDagOpen(true)}
                />
              </div>
            )}

            <footer className="aegis-workspace-footer">
              <span className="aegis-fingerprint">
                <Fingerprint size={14} />
                <span>Signing key</span>
                <code>{stats?.enclave_public_key_fingerprint || "Awaiting mediator"}</code>
                {stats && (
                  <CopyButton
                    value={stats.enclave_public_key_fingerprint}
                    label="Copy signing key fingerprint"
                  />
                )}
              </span>
              <span>{runs.length} recent receipts</span>
            </footer>
          </main>
        </div>

        <TopologyDagModal isOpen={dagOpen} onClose={() => setDagOpen(false)} />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    </MotionConfig>
  );
}
