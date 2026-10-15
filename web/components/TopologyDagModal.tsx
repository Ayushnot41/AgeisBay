"use strict";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TopologyData, getTopologyDag } from "@/lib/api";
import {
  Network,
  X,
  Layers,
  Shield,
  Cpu,
  Database,
  Terminal,
  ExternalLink,
  ArrowRight
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TopologyDagModal({ isOpen, onClose }: Props) {
  const [data, setData] = useState<TopologyData | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string>("ALL");
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      getTopologyDag()
        .then(setData)
        .catch((err) => console.error("Error loading DAG:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const clusters = data
    ? ["ALL", ...Array.from(new Set(data.nodes.map((n) => n.cluster)))]
    : ["ALL"];

  const filteredNodes = data
    ? selectedCluster === "ALL"
      ? data.nodes
      : data.nodes.filter((n) => n.cluster === selectedCluster)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card-elevated w-full max-w-5xl rounded-lg border border-hairline max-h-[85vh] flex flex-col overflow-hidden shadow-card"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-hairline bg-panel">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-status-cyan" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-100">
                GRAPHIFY ARCHITECTURAL TOPOLOGY &amp; PROVENANCE DAG
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Source: graphify-out/graph.json (AST Pass &amp; Enclave Inter-Process Contracts)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-card text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cluster Filter Tabs */}
        <div className="px-3.5 py-2 border-b border-hairline/60 bg-panel/50 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="text-slate-400 mr-1 text-[10px]">CLUSTER:</span>
          {clusters.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCluster(c)}
              className={`px-2 py-0.5 rounded transition-all ${
                selectedCluster === c
                  ? "bg-cyan-950 text-status-cyan border border-cyan-800/80 font-bold"
                  : "bg-panel hover:bg-card text-slate-400 border border-hairline"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Main Grid View */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto flex-1">
          {/* Nodes Column */}
          <div className="md:col-span-2 space-y-2">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
              ENCLAVE ENTITIES &amp; BOUNDARY NODES ({filteredNodes.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredNodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-2.5 rounded border transition-all cursor-pointer font-mono ${
                      isSelected
                        ? "bg-cyan-950/40 border-status-cyan shadow-glowCyan"
                        : "bg-panel hover:bg-panel-hover border-hairline"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-200">{n.label}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-status-cyan">
                        {n.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2">
                      {n.description}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[9px] text-slate-500 border-t border-hairline/40 pt-1">
                      <span>{n.cluster}</span>
                      <span className="text-status-pass">{n.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Inspector & Edges Column */}
          <div className="telemetry-well rounded p-3 flex flex-col justify-between font-mono text-[11px]">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 pb-1.5 mb-2 border-b border-hairline">
                SELECTED NODE DETAILS
              </div>
              {selectedNode ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ID / SYMBOL:</span>
                    <span className="text-status-cyan font-bold text-xs">{selectedNode.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">LABEL:</span>
                    <span className="text-slate-100">{selectedNode.label}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">STATUS &amp; SPEC:</span>
                    <span className="text-status-pass">{selectedNode.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">DESCRIPTION:</span>
                    <p className="text-slate-300 text-[10px] leading-relaxed">
                      {selectedNode.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-[10px]">
                  Click any node on the left to inspect architectural invariants and protocol boundaries.
                </div>
              )}
            </div>

            {/* Invariant Note */}
            <div className="mt-4 pt-2 border-t border-hairline text-[9px] text-slate-500">
              Deterministic AST export bound to Graphify knowledge repository.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
