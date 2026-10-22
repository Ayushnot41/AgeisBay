"use client";
import { useState, useEffect, useCallback } from "react";
import { Radio, ArrowUpRight, RefreshCw } from "lucide-react";
import {
  TinyFishStatus,
  TinyFishProbeResult,
  TinyFishThreat,
  getTinyFishStatus,
  getTinyFishThreats,
  executeBoundaryEgressProbe,
} from "@/lib/api";
import { Panel, Status, ErrorNotice } from "./WorkbenchUI";
export default function TinyFishSentinelCard({
  onLoadThreatIntoDispatcher,
}: {
  onLoadThreatIntoDispatcher?: (value: TinyFishThreat) => void;
}) {
  const [status, setStatus] = useState<TinyFishStatus | null>(null),
    [threats, setThreats] = useState<TinyFishThreat[]>([]);
  const [canary, setCanary] = useState("CANARY_SEC_TOKEN_ALPHA_9918"),
    [result, setResult] = useState<TinyFishProbeResult | null>(null);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, t] = await Promise.all([
        getTinyFishStatus(),
        getTinyFishThreats(),
      ]);
      setStatus(s);
      setThreats(t);
    } catch {
      setError(
        "Sentinel data could not be loaded. Check the mediator and retry.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function probe(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      setResult(await executeBoundaryEgressProbe(canary));
    } catch {
      setError("Probe simulation failed. Check the mediator and retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Panel
      id="sentinel"
      title="TinyFish sentinel"
      description="Boundary simulation & curated adversarial test cases"
      action={
        <div className="inline-actions">
          <Status
            value={
              loading
                ? "LOADING"
                : status?.api_key_configured
                  ? "CONFIGURED"
                  : "UNCONFIGURED"
            }
          />
          <button
            className="icon-button"
            aria-label="Refresh sentinel"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      }
    >
      <div className="panel-body">
        <ErrorNotice message={error} />
        <div className="sentinel-grid">
          <form onSubmit={probe} className="form-stack">
            <p className="subtle">
              The local probe models an egress denial. It does not contact
              TinyFish or attest a real firewall. API configuration is separate
              from live connectivity.
            </p>
            <div className="field">
              <label htmlFor="canary">Test canary payload</label>
              <input
                id="canary"
                value={canary}
                onChange={(e) => setCanary(e.target.value)}
                required
                maxLength={2000}
                disabled={busy}
              />
            </div>
            <div>
              <button
                className="button"
                type="submit"
                disabled={busy || !canary.trim()}
              >
                <Radio size={14} />
                {busy ? "Simulating…" : "Run probe simulation"}
              </button>
            </div>
            {result && (
              <div className="probe-result" role="status">
                <strong>
                  Simulation complete · {result.bytes_exfiltrated} modeled bytes
                  leaked
                </strong>
                <p className="subtle">
                  No live boundary verification was performed.
                </p>
                <code>{result.sha256_probe_digest}</code>
              </div>
            )}
          </form>
          <div>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <strong style={{ fontSize: 13 }}>Curated test corpus</strong>
              <span className="subtle">{threats.length} scenarios</span>
            </div>
            <div className="threat-list">
              {loading ? (
                <p className="subtle">Loading scenarios…</p>
              ) : !threats.length ? (
                <p className="subtle">
                  No scenarios available. Retry loading Sentinel data.
                </p>
              ) : (
                threats.map((t) => (
                  <div key={t.id} className="threat-item">
                    <div>
                      <strong>{t.name}</strong>
                      <p>
                        {t.vector.replaceAll("_", " ")} · {t.severity}
                      </p>
                    </div>
                    {onLoadThreatIntoDispatcher && (
                      <button
                        className="icon-button"
                        aria-label={`Load ${t.name} into dispatcher`}
                        onClick={() => onLoadThreatIntoDispatcher(t)}
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
