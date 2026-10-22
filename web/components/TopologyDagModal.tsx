"use client";
import { useRef, useEffect, useState } from "react";
import { X } from "lucide-react";
import { TopologyData, getTopologyDag } from "@/lib/api";
import { ErrorNotice } from "./WorkbenchUI";
export default function TopologyDagModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<TopologyData | null>(null),
    [error, setError] = useState<string | null>(null),
    [cluster, setCluster] = useState("ALL"),
    [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (isOpen) {
      if (!el.open) el.showModal();
    } else if (el.open) el.close();
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    setError(null);
    getTopologyDag()
      .then((value) => {
        if (active) setData(value);
      })
      .catch(() => {
        if (active)
          setError(
            "Architecture data could not be loaded. Retry after checking the mediator.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, attempt]);
  const clusters = [
    "ALL",
    ...Array.from(new Set(data?.nodes.map((n) => n.cluster) || [])),
  ];
  return (
    <dialog
      ref={dialog}
      className="dialog"
      aria-labelledby="dag-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const r = dialog.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <header className="panel-heading">
        <div>
          <h2 id="dag-title">Architecture & protocol boundaries</h2>
          <p>Declared architecture · not live runtime attestation</p>
        </div>
        <button
          autoFocus
          className="icon-button"
          aria-label="Close architecture"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </header>
      <div className="dialog-content">
        <ErrorNotice message={error} />
        {error && (
          <button className="button" onClick={() => setAttempt((x) => x + 1)}>
            Retry topology
          </button>
        )}
        <div className="inline-actions" style={{ marginBottom: 20 }}>
          {clusters.map((c) => (
            <button
              className="button"
              key={c}
              aria-pressed={cluster === c}
              onClick={() => setCluster(c)}
            >
              {c}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="subtle" role="status">
            Loading architecture…
          </p>
        ) : (
          <>
            <div className="dialog-grid">
              {data?.nodes
                .filter((n) => cluster === "ALL" || n.cluster === cluster)
                .map((n) => (
                  <article className="dag-node" key={n.id}>
                    <strong>{n.label}</strong>
                    <p>{n.description}</p>
                    <code>
                      {n.cluster} · {n.type}
                    </code>
                  </article>
                ))}
            </div>
            <h3 style={{ margin: "24px 0 12px" }}>Protocol connections</h3>
            <div
              className="data-scroll"
              tabIndex={0}
              role="region"
              aria-label="Architecture connections"
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Target</th>
                    <th>Protocol</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.edges
                    .filter(
                      (e) =>
                        cluster === "ALL" ||
                        data.nodes.some(
                          (n) =>
                            n.cluster === cluster &&
                            (n.id === e.source || n.id === e.target),
                        ),
                    )
                    .map((e, i) => (
                      <tr key={i}>
                        <td>{e.source}</td>
                        <td>{e.target}</td>
                        <td>{e.protocol || e.label}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
