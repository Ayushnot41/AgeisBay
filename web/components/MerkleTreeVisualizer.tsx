"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitBranch, RotateCcw, FlaskConical, Download } from "lucide-react";
import {
  EvaluationRun,
  simulateTamper,
  restoreTamper,
  verifyRun,
  ReceiptVerification,
} from "@/lib/api";
import { Panel, Status, ErrorNotice, CopyButton } from "./WorkbenchUI";
const leafNames = ["config", "checks", "result", "status"] as const;
export default function MerkleTreeVisualizer({
  runs,
  selectedRun,
  onSelectRun,
  onTamperToggled,
}: {
  runs: EvaluationRun[];
  selectedRun: EvaluationRun | null;
  onSelectRun: (run: EvaluationRun) => void;
  onTamperToggled: () => void;
}) {
  const run = selectedRun || runs[0] || null;
  const [verification, setVerification] = useState<{
    id: string;
    records: string;
    value: ReceiptVerification;
  } | null>(null);
  const [leaf, setLeaf] = useState<(typeof leafNames)[number] | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const records = JSON.stringify(run);
  useEffect(() => {
    let active = true;
    setVerification(null);
    setError(null);
    if (run)
      verifyRun(run.run_id)
        .then((value) => {
          if (active) setVerification({ id: run.run_id, records, value });
        })
        .catch(() => {
          if (active)
            setError(
              "Receipt verification is unavailable. Refresh the connection to retry.",
            );
        });
    return () => {
      active = false;
    };
  }, [run?.run_id, records]);
  const proof =
    verification &&
    verification.id === run?.run_id &&
    verification.records === records
      ? verification.value
      : null;
  async function tamper() {
    if (!run || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (run.is_tampered) await restoreTamper(run.run_id);
      else await simulateTamper(run.run_id);
      await onTamperToggled();
    } catch {
      setError(
        "Could not update the tamper demonstration. Refresh the receipt before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }
  function download() {
    if (!run) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ run, verification: proof }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${run.run_id}-receipt.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Panel
      id="receipts"
      title="Receipt inspector"
      description="Recomputed SHA-256 tree & Ed25519 verification"
      action={
        run ? (
          <Status
            value={proof ? (proof.valid ? "VERIFIED" : "FAIL") : "VERIFYING"}
          />
        ) : undefined
      }
    >
      {!run ? (
        <div className="empty-state">
          <GitBranch size={28} />
          <strong>Your evidence starts here</strong>Dispatch an evaluation to
          inspect its signed receipt.
        </div>
      ) : (
        <>
          <div className="panel-body">
            <div className="field">
              <label htmlFor="receipt-run">Evaluation receipt</label>
              <select
                id="receipt-run"
                className="run-select"
                value={run.run_id}
                disabled={busy}
                onChange={(e) => {
                  const value = runs.find((r) => r.run_id === e.target.value);
                  if (value) {
                    setLeaf(null);
                    onSelectRun(value);
                  }
                }}
              >
                {!runs.some((r) => r.run_id === run.run_id) && (
                  <option value={run.run_id}>{run.run_id}</option>
                )}
                {runs.map((r) => (
                  <option value={r.run_id} key={r.run_id}>
                    {r.run_id} · {r.mode} · {r.status}
                  </option>
                ))}
              </select>
            </div>
            <ErrorNotice message={error} />
            <div className="receipt-root" style={{ marginTop: 18 }}>
              <div className="row-between">
                <span className="subtle">Merkle root</span>
                <CopyButton value={run.merkle_root} label="Copy Merkle root" />
              </div>
              <div className="hash">{run.merkle_root}</div>
              <div className="row-between" style={{ marginTop: 12 }}>
                <span className="subtle">Stored-root signature</span>
                <Status
                  value={
                    proof ? (proof.sig_valid ? "PASS" : "FAIL") : "PENDING"
                  }
                />
                <CopyButton
                  value={run.ed25519_signature}
                  label="Copy Ed25519 signature"
                />
              </div>
            </div>
            <svg className="tree-lines" viewBox="0 0 400 25" aria-hidden="true">
              <path d="M200 0V12H100V25M200 12H300V25" />
            </svg>
            <div className="tree-branches">
              {["a", "b"].map((key) => (
                <div className="branch" key={key}>
                  <div className="row-between">
                    <span>Branch {key.toUpperCase()}</span>
                    <Status
                      value={
                        proof
                          ? proof.branches[`branch_${key}_valid`]
                            ? "PASS"
                            : "FAIL"
                          : "PENDING"
                      }
                    />
                  </div>
                  <code title={key === "a" ? run.branch_a : run.branch_b}>
                    {key === "a" ? run.branch_a : run.branch_b}
                  </code>
                </div>
              ))}
            </div>
            <div className="leaf-grid">
              {leafNames.map((name, i) => {
                const valid = proof?.leaves[`leaf_0${i + 1}_valid`];
                const hash = run[
                  `leaf_0${i + 1}_${name}` as keyof EvaluationRun
                ] as string;
                return (
                  <button
                    key={name}
                    className={`leaf ${valid === false ? "failed" : ""}`}
                    aria-expanded={leaf === name}
                    aria-controls="leaf-detail"
                    onClick={() => setLeaf(leaf === name ? null : name)}
                  >
                    <strong>{name[0].toUpperCase() + name.slice(1)}</strong>
                    <Status
                      value={
                        valid === undefined
                          ? "PENDING"
                          : valid
                            ? "PASS"
                            : "FAIL"
                      }
                    />
                    <code>{hash}</code>
                  </button>
                );
              })}
            </div>
            {leaf && (
              <motion.div
                id="leaf-detail"
                className="receipt-json"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.16 }}
              >
                <div className="row-between">
                  <strong className="subtle">{leaf} · stored pre-image</strong>
                  <button className="button" onClick={() => setLeaf(null)}>
                    Close
                  </button>
                </div>
                <pre>{JSON.stringify(run.raw_records[leaf], null, 2)}</pre>
              </motion.div>
            )}
            <p className="subtle" style={{ marginTop: 14 }}>
              {proof?.valid === false
                ? "Receipt mismatch: inspect the failed leaf or branch above. A valid signature alone does not establish record integrity."
                : "Verification recomputes stored records on the mediator. Use the offline verifier for independent validation."}
            </p>
          </div>
          <div className="panel-footer">
            <button className="button" onClick={download}>
              <Download size={14} />
              Export receipt
            </button>
            <button
              className={`button ${run.is_tampered ? "" : "button-danger"}`}
              onClick={tamper}
              disabled={busy}
            >
              {run.is_tampered ? (
                <RotateCcw size={14} />
              ) : (
                <FlaskConical size={14} />
              )}{" "}
              {busy
                ? "Updating…"
                : run.is_tampered
                  ? "Restore receipt"
                  : "Simulate tamper"}
            </button>
          </div>
        </>
      )}
    </Panel>
  );
}
