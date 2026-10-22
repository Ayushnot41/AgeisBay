"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Cpu,
  LockKeyhole,
  ArrowDown,
  Expand,
  Network,
} from "lucide-react";
import { EvaluationRun } from "@/lib/api";
import { Panel } from "./WorkbenchUI";
const checks = [
  ["Egress boundary", "net_isolation_passed"],
  ["Prompt blinding", "pretest_blinding_passed"],
  ["Policy freeze", "policy_freeze_verified"],
  ["Context cleanup", "kv_canary_clean"],
  ["Release window", "within_release_window"],
  ["Teardown trace", "teardown_trace_complete"],
] as const;
export default function EnclaveTopology({
  onOpenDagModal,
  activeFault,
  selectedRun,
}: {
  onOpenDagModal: () => void;
  activeFault: string;
  selectedRun: EvaluationRun | null;
}) {
  const [node, setNode] = useState("mediator");
  const descriptions: Record<string, string> = {
    red: "Red workspace submits an encrypted adversarial prompt.",
    blue: "Blue workspace commits the defense policy before evaluation.",
    mediator: "Mediator decrypts, evaluates, and signs the four-leaf receipt.",
  };
  return (
    <Panel
      title="Enclave topology"
      description="Protocol map & recorded boundary checks"
      action={
        <button
          className="icon-button"
          onClick={onOpenDagModal}
          aria-label="Open architecture topology"
        >
          <Expand size={15} />
        </button>
      }
    >
      <div className="topology-stage">
        <div className="topology-map">
          <button
            className="topology-node red"
            aria-pressed={node === "red"}
            onClick={() => setNode("red")}
          >
            <Shield />
            <strong>Red workspace</strong>
            <code>172.28.1.0/24</code>
          </button>
          <button
            className="topology-node blue"
            aria-pressed={node === "blue"}
            onClick={() => setNode("blue")}
          >
            <LockKeyhole />
            <strong>Blue workspace</strong>
            <code>172.28.2.0/24</code>
          </button>
          <div className="topology-flow">
            <ArrowDown size={15} />
            <span>AES-256-GCM · Commit / reveal</span>
            <ArrowDown size={15} />
          </div>
          <motion.button
            className="topology-node mediator"
            aria-pressed={node === "mediator"}
            onClick={() => setNode("mediator")}
            whileTap={{ scale: 0.99 }}
          >
            <Cpu />
            <strong>Trusted mediator & LLM worker</strong>
            <code>172.28.3.0/24 · Ed25519 receipt</code>
          </motion.button>
        </div>
        <p className="topology-caption" role="status">
          {descriptions[node]}
        </p>
      </div>
      <div className="check-list">
        {checks.map(([label, key]) => (
          <div key={key} className="check-item">
            <span>{label}</span>
            <strong>
              {selectedRun
                ? selectedRun[key] === 1
                  ? "Pass"
                  : selectedRun[key] === 0
                    ? "Failed"
                    : "Unknown"
                : "Awaiting run"}
            </strong>
          </div>
        ))}
      </div>
      <div className="panel-footer">
        <span>
          <Network size={13} style={{ display: "inline", marginRight: 7 }} />
          Synthetic topology · no runtime attestation
        </span>
        <span>
          Next fault:{" "}
          {activeFault === "CLEAN"
            ? "Clean"
            : activeFault.split("_").slice(0, 2).join(" ")}
        </span>
      </div>
    </Panel>
  );
}
