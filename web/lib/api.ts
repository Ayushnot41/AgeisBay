export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(
  /\/$/,
  "",
);

export interface TelemetryStats {
  total_runs: number;
  eligible_runs: number;
  invalid_runs: number;
  incomplete_runs: number;
  tampered_runs: number;
  p50_raw_ms: number | null;
  p95_raw_ms: number | null;
  p50_padded_ms: number | null;
  p95_padded_ms: number | null;
  timing_attack_auc: number | null;
  seccomp_enforced: boolean | null;
  cgroups_v2_enforced: boolean | null;
  rootless_docker_enforced: boolean | null;
  enclave_public_key_fingerprint: string;
  ledger_verification: "VERIFIED" | "TAMPER_DETECTED" | "EMPTY";
}

export interface EvaluationRun {
  run_id: string;
  experiment_id: string;
  mode: "BASELINE" | "HARDENED";
  fault_class: string;
  attack_commitment: string;
  defense_artifact_hash: string;
  model_digest: string;
  status: "ELIGIBLE" | "INVALID" | "INCOMPLETE";
  score_contributed: number;
  safety_passed: number;
  raw_latency_ms: number;
  padded_latency_ms: number;
  leaf_01_config: string;
  leaf_02_checks: string;
  leaf_03_result: string;
  leaf_04_status: string;
  branch_a: string;
  branch_b: string;
  merkle_root: string;
  ed25519_signature: string;
  raw_records: {
    config: any;
    checks: any;
    result: any;
    status: any;
  };
  net_isolation_passed?: number;
  pretest_blinding_passed?: number;
  policy_freeze_verified?: number;
  kv_canary_clean?: number;
  within_release_window?: number;
  teardown_trace_complete?: number;
  rejection_reason?: string;
  is_tampered?: number;
  created_at: string;
}

export interface AblationMatrixRow {
  fault_class: string;
  baseline: {
    status: string;
    score_contributed: number;
    safety_passed: number;
    raw_latency_ms: number;
    contaminated: boolean;
  };
  hardened: {
    status: string;
    score_contributed: number;
    safety_passed: number;
    padded_latency_ms: number;
    gated_correctly: boolean;
  };
}

export interface DagNode {
  id: string;
  label: string;
  type: string;
  cluster: string;
  status: string;
  description: string;
  cidr?: string;
}

export interface DagEdge {
  source: string;
  target: string;
  label: string;
  protocol: string;
}

export interface TopologyData {
  project: string;
  version: string;
  description: string;
  nodes: DagNode[];
  edges: DagEdge[];
}

export async function getTelemetryStats(): Promise<TelemetryStats> {
  const res = await fetch(`${API_BASE}/api/telemetry/stats`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Failed to fetch telemetry stats");
  return res.json();
}

export async function getRuns(limit: number = 50): Promise<EvaluationRun[]> {
  const res = await fetch(`${API_BASE}/api/runs?limit=${limit}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Failed to fetch evaluation runs");
  return res.json();
}

export async function getRunDetail(runId: string): Promise<EvaluationRun> {
  const res = await fetch(`${API_BASE}/api/runs/${runId}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Failed to fetch run detail: ${runId}`);
  return res.json();
}

export async function dispatchRun(payload: {
  prompt: string;
  policy: string;
  model_id: string;
  mode: string;
  fault_class: string;
  experiment_id: string;
}) {
  const res = await fetch(`${API_BASE}/api/runs/dispatch`, {
    method: "POST",
    signal: AbortSignal.timeout(60000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok)
    throw new Error(
      "Dispatch was not confirmed. Refresh the ledger before retrying to avoid a duplicate evaluation.",
    );
  return res.json();
}

export async function triggerPairedExperiments() {
  const res = await fetch(`${API_BASE}/api/experiments/paired`, {
    method: "POST",
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error("Failed to trigger paired experiments");
  return res.json();
}

export async function getAblationMatrix(): Promise<{
  matrix: AblationMatrixRow[];
  timing_analysis: {
    baseline_auc: number;
    hardened_auc: number;
    side_channel_leakage_prevented: boolean;
  };
}> {
  const res = await fetch(`${API_BASE}/api/experiments/matrix`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Failed to fetch ablation matrix");
  return res.json();
}

export async function simulateTamper(runId?: string) {
  const res = await fetch(`${API_BASE}/api/tamper/simulate`, {
    method: "POST",
    signal: AbortSignal.timeout(60000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(runId ? { run_id: runId } : {}),
  });
  if (!res.ok) throw new Error("Failed to simulate tamper");
  return res.json();
}

export async function restoreTamper(runId?: string) {
  const res = await fetch(`${API_BASE}/api/tamper/restore`, {
    method: "POST",
    signal: AbortSignal.timeout(60000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(runId ? { run_id: runId } : {}),
  });
  if (!res.ok) throw new Error("Failed to restore tamper");
  return res.json();
}

export async function getTopologyDag(): Promise<TopologyData> {
  const res = await fetch(`${API_BASE}/api/topology/dag`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Failed to fetch topology DAG");
  return res.json();
}

export interface TinyFishStatus {
  status: string;
  api_key_configured: boolean;
  masked_key: string;
  endpoint: string;
  cli_detected: boolean;
  active_harnesses: string[];
  capabilities: string[];
}

export interface TinyFishProbeResult {
  probe_id: string;
  timestamp: string;
  canary_token_bound: string;
  outbound_egress_allowed: boolean;
  interception_subsystem: string;
  enclave_boundary_status: string;
  bytes_exfiltrated: number;
  external_leak_detected: boolean;
  tinyfish_sentinel_verified: boolean;
  sha256_probe_digest: string;
}

export interface TinyFishThreat {
  id: string;
  name: string;
  vector: string;
  payload: string;
  severity: string;
  source: string;
  target_enclave_check: string;
}

export async function getTinyFishStatus(): Promise<TinyFishStatus> {
  const res = await fetch(`${API_BASE}/api/tinyfish/status`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Failed to fetch TinyFish status");
  return res.json();
}

export async function executeBoundaryEgressProbe(
  canaryToken?: string,
): Promise<TinyFishProbeResult> {
  const res = await fetch(`${API_BASE}/api/tinyfish/probe/egress`, {
    method: "POST",
    signal: AbortSignal.timeout(60000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      canary_token: canaryToken || "CANARY_SEC_TOKEN_ALPHA_9918",
    }),
  });
  if (!res.ok) throw new Error("Failed to execute TinyFish egress probe");
  return res.json();
}

export async function getTinyFishThreats(): Promise<TinyFishThreat[]> {
  const res = await fetch(`${API_BASE}/api/tinyfish/threats`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Failed to fetch TinyFish threats");
  return res.json();
}

export interface ReceiptVerification {
  valid: boolean;
  root_match: boolean;
  sig_valid: boolean;
  leaves: Record<string, boolean>;
  branches: Record<string, boolean>;
}
export async function verifyRun(runId: string): Promise<ReceiptVerification> {
  const response = await fetch(
    `${API_BASE}/api/runs/${encodeURIComponent(runId)}/verify`,
    { cache: "no-store", signal: AbortSignal.timeout(15000) },
  );
  if (!response.ok) throw new Error("Unable to verify receipt");
  return response.json();
}

export interface PagedRunsResponse {
  items: EvaluationRun[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function getPagedRuns(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  mode?: string;
  faultClass?: string;
} = {}): Promise<PagedRunsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.pageSize) query.set('page_size', params.pageSize.toString());
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.mode) query.set('mode', params.mode);
  if (params.faultClass) query.set('fault_class', params.faultClass);

  const qs = query.toString();
  const url = `${API_BASE}/api/runs/paged${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error('Failed to fetch paged runs');
  return res.json();
}
