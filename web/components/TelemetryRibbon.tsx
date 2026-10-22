"use client";
import { ShieldCheck, Radio, RefreshCw } from "lucide-react";
import { TelemetryStats } from "@/lib/api";
import { Status } from "./WorkbenchUI";
export default function TelemetryRibbon({
  stats,
  onRefresh,
  isStreaming,
  refreshing,
  stale,
}: {
  stats: TelemetryStats | null;
  onRefresh: () => void;
  isStreaming: boolean;
  refreshing: boolean;
  stale: boolean;
}) {
  return (
    <header className="brandbar">
      <div className="brand">
        <div className="brand-mark">
          <ShieldCheck size={23} strokeWidth={1.5} />
        </div>
        <div>
          <strong>AegisBay</strong>
          <p>Adversarial evaluation & evidence</p>
        </div>
      </div>
      <div className="header-actions">
        <span className="connection">
          <Radio size={14} />
          {stale
            ? "Connection interrupted"
            : isStreaming
              ? "Live event stream"
              : stats
                ? "Polling every 5s"
                : "Connecting"}
        </span>
        <Status
          value={
            stale ? "STALE" : stats?.ledger_verification || "AWAITING DATA"
          }
        />
        <button className="button" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          {refreshing ? "Syncing" : "Refresh"}
        </button>
      </div>
    </header>
  );
}
