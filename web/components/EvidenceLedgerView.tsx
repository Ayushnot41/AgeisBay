"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { EvaluationRun, getPagedRuns, PagedRunsResponse, API_BASE } from "@/lib/api";
import { Panel, Status, CopyButton, ErrorNotice } from "./WorkbenchUI";

interface EvidenceLedgerViewProps {
  selectedRun: EvaluationRun | null;
  onSelectRun: (run: EvaluationRun) => void;
  onTamperToggled: () => void;
}

export default function EvidenceLedgerView({
  selectedRun,
  onSelectRun,
  onTamperToggled,
}: EvidenceLedgerViewProps) {
  const [data, setData] = useState<PagedRunsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modeFilter, setModeFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPagedRuns({
        page,
        pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        mode: modeFilter || undefined,
      });
      setData(res);
      if (res.items.length > 0 && !selectedRun) {
        onSelectRun(res.items[0]);
      }
    } catch {
      setError("Unable to retrieve paginated ledger runs. Check mediator connection.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, modeFilter, selectedRun, onSelectRun]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchPage();
  }

  function handleExportCheckpoint() {
    window.open(`${API_BASE}/api/runs/export/checkpoint`, "_blank");
  }

  return (
    <Panel
      id="ledger-view"
      title="Evidence Ledger & Merkle Proof Explorer"
      description="Cryptographically verifiable SQLite audit ledger with RFC 8785 Merkle receipts"
      action={
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className="icon-button"
            onClick={fetchPage}
            disabled={loading}
            title="Refresh Ledger"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
          <button
            className="secondary-button"
            onClick={handleExportCheckpoint}
            style={{ fontSize: "11px", padding: "4px 8px", display: "flex", alignItems: "center", gap: "5px" }}
          >
            <Download size={13} />
            <span>Export Checkpoint</span>
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Search and Filters Bar */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: "flex", flex: 1, minWidth: "220px", position: "relative" }}
          >
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search by Run ID, Experiment ID, or Fault..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "32px",
                paddingRight: "10px",
                paddingTop: "6px",
                paddingBottom: "6px",
                background: "var(--raised)",
                border: "1px solid var(--border)",
                borderRadius: "5px",
                color: "var(--text)",
                fontSize: "12px",
              }}
            />
          </form>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{
                background: "var(--raised)",
                border: "1px solid var(--border)",
                borderRadius: "5px",
                color: "var(--text)",
                fontSize: "11px",
                padding: "5px 8px",
              }}
            >
              <option value="">All Statuses</option>
              <option value="ELIGIBLE">ELIGIBLE</option>
              <option value="INVALID">INVALID</option>
              <option value="INCOMPLETE">INCOMPLETE</option>
            </select>
          </div>

          {/* Mode Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Mode:</span>
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setPage(1);
              }}
              style={{
                background: "var(--raised)",
                border: "1px solid var(--border)",
                borderRadius: "5px",
                color: "var(--text)",
                fontSize: "11px",
                padding: "5px 8px",
              }}
            >
              <option value="">All Modes</option>
              <option value="HARDENED">HARDENED</option>
              <option value="BASELINE">BASELINE</option>
            </select>
          </div>

          {/* Page Size Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              style={{
                background: "var(--raised)",
                border: "1px solid var(--border)",
                borderRadius: "5px",
                color: "var(--text)",
                fontSize: "11px",
                padding: "5px 8px",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <ErrorNotice message={error} />

        {/* Ledger Table */}
        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "6px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "11px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "var(--raised)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "8px 10px", color: "var(--muted)", fontWeight: 600 }}>RUN ID</th>
                <th style={{ padding: "8px 10px", color: "var(--muted)", fontWeight: 600 }}>MODE</th>
                <th style={{ padding: "8px 10px", color: "var(--muted)", fontWeight: 600 }}>FAULT INJECTED</th>
                <th style={{ padding: "8px 10px", color: "var(--muted)", fontWeight: 600 }}>CHECKS</th>
                <th style={{ padding: "8px 10px", color: "var(--muted)", fontWeight: 600 }}>LATENCY</th>
                <th style={{ padding: "8px 10px", color: "var(--muted)", fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: "8px 10px", color: "var(--muted)", fontWeight: 600 }}>MERKLE ROOT</th>
                <th style={{ padding: "8px 10px", color: "var(--muted)", fontWeight: 600, textAlign: "right" }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {!data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "24px", textAlign: "center", color: "var(--muted)" }}>
                    {loading ? "Loading ledger records..." : "No runs match the specified filter criteria."}
                  </td>
                </tr>
              ) : (
                data.items.map((r) => {
                  const isSelected = selectedRun?.run_id === r.run_id;
                  const checksPassed =
                    (r.net_isolation_passed ?? 0) +
                    (r.pretest_blinding_passed ?? 0) +
                    (r.policy_freeze_verified ?? 0) +
                    (r.kv_canary_clean ?? 0) +
                    (r.within_release_window ?? 0) +
                    (r.teardown_trace_complete ?? 0);

                  return (
                    <tr
                      key={r.run_id}
                      onClick={() => onSelectRun(r)}
                      style={{
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: isSelected ? "rgba(6, 182, 212, 0.08)" : "transparent",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <code style={{ color: isSelected ? "var(--cyan)" : "var(--text)", fontWeight: 600 }}>
                            {r.run_id}
                          </code>
                          {r.is_tampered === 1 && (
                            <span
                              style={{
                                fontSize: "9px",
                                background: "#EF4444",
                                color: "#fff",
                                padding: "1px 4px",
                                borderRadius: "3px",
                                fontWeight: 700,
                              }}
                            >
                              TAMPERED
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "9.5px", color: "var(--muted)" }}>{r.experiment_id}</div>
                      </td>

                      <td style={{ padding: "8px 10px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: r.mode === "HARDENED" ? "rgba(16, 185, 129, 0.15)" : "rgba(148, 163, 184, 0.15)",
                            color: r.mode === "HARDENED" ? "#10B981" : "#94A3B8",
                            fontWeight: 600,
                          }}
                        >
                          {r.mode}
                        </span>
                      </td>

                      <td style={{ padding: "8px 10px" }}>
                        <code style={{ fontSize: "10.5px" }}>{r.fault_class}</code>
                      </td>

                      <td style={{ padding: "8px 10px" }}>
                        <span
                          style={{
                            color: checksPassed === 6 ? "#10B981" : "#EF4444",
                            fontWeight: 600,
                          }}
                        >
                          {checksPassed}/6
                        </span>
                      </td>

                      <td style={{ padding: "8px 10px" }}>
                        <div>{r.padded_latency_ms.toFixed(1)} ms</div>
                        <div style={{ fontSize: "9.5px", color: "var(--muted)" }}>
                          raw: {r.raw_latency_ms.toFixed(1)}ms
                        </div>
                      </td>

                      <td style={{ padding: "8px 10px" }}>
                        <Status value={r.status} />
                      </td>

                      <td style={{ padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <code style={{ fontSize: "10px", color: "var(--muted)" }}>
                            {r.merkle_root.substring(0, 10)}...{r.merkle_root.substring(58)}
                          </code>
                          <CopyButton value={r.merkle_root} label="Copy Merkle root" />
                        </div>
                      </td>

                      <td style={{ padding: "8px 10px", textAlign: "right" }}>
                        <button
                          className="secondary-button"
                          style={{
                            fontSize: "10px",
                            padding: "3px 7px",
                            borderColor: isSelected ? "var(--cyan)" : undefined,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRun(r);
                          }}
                        >
                          {isSelected ? "Inspecting" : "Inspect"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && data.total > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "6px",
              fontSize: "11px",
              color: "var(--muted)",
            }}
          >
            <div>
              Showing {data.items.length > 0 ? (data.page - 1) * data.page_size + 1 : 0} to{" "}
              {Math.min(data.page * data.page_size, data.total)} of <strong>{data.total}</strong> committed runs
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                className="secondary-button"
                disabled={data.page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "3px" }}
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>
              <span style={{ padding: "0 6px", fontWeight: 600, color: "var(--text)" }}>
                Page {data.page} of {data.total_pages}
              </span>
              <button
                className="secondary-button"
                disabled={data.page >= data.total_pages || loading}
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "3px" }}
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
