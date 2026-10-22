"use client";
import { useState } from "react";
import { Play, FlaskConical } from "lucide-react";
import { triggerPairedExperiments, AblationMatrixRow } from "@/lib/api";
import { Panel, Status, ErrorNotice } from "./WorkbenchUI";
import { faultOptions } from "./CommitRevealDispatcher";

interface PairedMatrixComparatorProps {
  matrix?: AblationMatrixRow[];
  matrixData?: AblationMatrixRow[];
  onTriggerComplete?: () => void;
  onPairedRunComplete?: () => void;
}

export default function PairedMatrixComparator({
  matrix,
  matrixData,
  onTriggerComplete,
  onPairedRunComplete,
}: PairedMatrixComparatorProps) {
  const [busy, setBusy] = useState(false);
  const [chart, setChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = matrixData || matrix || [];
  const handleComplete = onTriggerComplete || onPairedRunComplete || (() => {});

  async function run() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await triggerPairedExperiments();
      await handleComplete();
    } catch {
      setError(
        "Paired evaluation failed. Refresh the ledger before retrying; some runs may have completed.",
      );
    } finally {
      setBusy(false);
    }
  }

  const label = (id: string) =>
    faultOptions.find(([key]) => key === id)?.[1] || id;

  return (
    <Panel
      id="comparison"
      title="Paired fault comparison"
      description="Baseline vs. hardened · seven controlled scenarios"
    >
      <div className="panel-body row-between">
        <div className="segmented" role="group" aria-label="Comparison view">
          <button aria-pressed={!chart} onClick={() => setChart(false)}>
            Matrix
          </button>
          <button aria-pressed={chart} onClick={() => setChart(true)}>
            Score chart
          </button>
        </div>
        <button className="button" onClick={run} disabled={busy}>
          <Play size={13} />
          {busy ? "Running 14 evaluations…" : "Run paired tests"}
        </button>
      </div>
      <ErrorNotice message={error} />
      {!rows.length ? (
        <div className="empty-state">
          <FlaskConical size={26} />
          <strong>No paired evidence yet</strong>Run paired tests to compare the
          same scenarios across both modes.
        </div>
      ) : chart ? (
        <div className="panel-body">
          <div className="legend">
            <span>Rose · Baseline</span>
            <span>Cyan · Hardened</span>
          </div>
          {rows.map((row) => (
            <div className="chart-row" key={row.fault_class}>
              <span>{label(row.fault_class)}</span>
              <div>
                {[
                  row.baseline.score_contributed,
                  row.hardened.score_contributed,
                ].map((score, i) => (
                  <div
                    key={i}
                    aria-label={`${i ? "Hardened" : "Baseline"} contributed score: ${score}`}
                  >
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${i ? "hardened" : ""}`}
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                    <span className="sr-only">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="data-scroll"
          tabIndex={0}
          role="region"
          aria-label="Paired evaluation results"
        >
          <table className="data-table">
            <caption>
              Latest complete paired experiment. Score 1 contributes; 0 is
              excluded.
            </caption>
            <thead>
              <tr>
                <th scope="col">Scenario</th>
                <th scope="col">Baseline</th>
                <th scope="col">Hardened</th>
                <th scope="col">Score B / H</th>
                <th scope="col">Release</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.fault_class}>
                  <th scope="row">{label(row.fault_class)}</th>
                  <td>
                    <Status value={row.baseline.status} />
                  </td>
                  <td>
                    <Status value={row.hardened.status} />
                  </td>
                  <td className="font-mono">
                    {row.baseline.score_contributed} /{" "}
                    {row.hardened.score_contributed}
                  </td>
                  <td className="font-mono">
                    {row.hardened.padded_latency_ms} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="panel-footer">
        <span>Four integrity faults · two completion faults</span>
        <span role="status">
          {busy
            ? "Collecting paired evidence"
            : `${rows.length} paired scenarios`}
        </span>
      </div>
    </Panel>
  );
}
