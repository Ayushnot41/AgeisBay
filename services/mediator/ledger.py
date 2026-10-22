import os
import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


class LedgerManager:
    def __init__(self, db_path: str = "data/aegisbay_ledger.db", checkpoint_path: str = "data/latest_checkpoint.json"):
        self.db_path = db_path
        self.checkpoint_path = checkpoint_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    @contextmanager
    def _connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def _init_db(self):
        with self._connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS runs (
                    run_id TEXT PRIMARY KEY,
                    experiment_id TEXT,
                    mode TEXT NOT NULL,
                    fault_class TEXT NOT NULL,
                    attack_commitment TEXT NOT NULL,
                    defense_artifact_hash TEXT NOT NULL,
                    model_digest TEXT NOT NULL,
                    status TEXT NOT NULL,
                    score_contributed INTEGER NOT NULL,
                    safety_passed INTEGER NOT NULL,
                    raw_latency_ms REAL NOT NULL,
                    padded_latency_ms REAL NOT NULL,
                    leaf_01_config TEXT NOT NULL,
                    leaf_02_checks TEXT NOT NULL,
                    leaf_03_result TEXT NOT NULL,
                    leaf_04_status TEXT NOT NULL,
                    branch_a TEXT NOT NULL,
                    branch_b TEXT NOT NULL,
                    merkle_root TEXT NOT NULL,
                    ed25519_signature TEXT NOT NULL,
                    raw_records_json TEXT NOT NULL,
                    is_tampered INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS boundary_checks (
                    run_id TEXT PRIMARY KEY,
                    net_isolation_passed INTEGER NOT NULL,
                    pretest_blinding_passed INTEGER NOT NULL,
                    policy_freeze_verified INTEGER NOT NULL,
                    kv_canary_clean INTEGER NOT NULL,
                    within_release_window INTEGER NOT NULL,
                    teardown_trace_complete INTEGER NOT NULL,
                    rejection_reason TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(run_id) REFERENCES runs(run_id)
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tamper_backups (
                    run_id TEXT PRIMARY KEY,
                    original_records_json TEXT NOT NULL,
                    original_leaf_03 TEXT NOT NULL,
                    tampered_at TEXT NOT NULL
                )
            """)
            conn.commit()

    def record_run(
        self,
        run_data: Dict[str, Any],
        receipt: Dict[str, Any],
        checks: Dict[str, Any]
    ) -> None:
        now_iso = datetime.now(timezone.utc).isoformat()
        with self._connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO runs (
                    run_id, experiment_id, mode, fault_class,
                    attack_commitment, defense_artifact_hash, model_digest,
                    status, score_contributed, safety_passed,
                    raw_latency_ms, padded_latency_ms,
                    leaf_01_config, leaf_02_checks, leaf_03_result, leaf_04_status,
                    branch_a, branch_b, merkle_root, ed25519_signature,
                    raw_records_json, is_tampered, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
            """, (
                run_data["run_id"],
                run_data.get("experiment_id", "default_exp"),
                run_data["mode"],
                run_data["fault_class"],
                run_data["attack_commitment"],
                run_data["defense_artifact_hash"],
                run_data["model_digest"],
                run_data["status"],
                1 if run_data["score_contributed"] else 0,
                1 if run_data.get("safety_passed", False) else 0,
                run_data["raw_latency_ms"],
                run_data["padded_latency_ms"],
                receipt["leaves"]["leaf_01_config"],
                receipt["leaves"]["leaf_02_checks"],
                receipt["leaves"]["leaf_03_result"],
                receipt["leaves"]["leaf_04_status"],
                receipt["branches"]["branch_a"],
                receipt["branches"]["branch_b"],
                receipt["merkle_root"],
                receipt["ed25519_signature"],
                json.dumps(receipt["raw_records"]),
                now_iso
            ))

            cursor.execute("""
                INSERT OR REPLACE INTO boundary_checks (
                    run_id, net_isolation_passed, pretest_blinding_passed,
                    policy_freeze_verified, kv_canary_clean,
                    within_release_window, teardown_trace_complete,
                    rejection_reason, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                run_data["run_id"],
                1 if checks["net_isolation_passed"] else 0,
                1 if checks["pretest_blinding_passed"] else 0,
                1 if checks["policy_freeze_verified"] else 0,
                1 if checks["kv_canary_clean"] else 0,
                1 if checks["within_release_window"] else 0,
                1 if checks["teardown_trace_complete"] else 0,
                checks.get("rejection_reason"),
                now_iso
            ))
            conn.commit()

        self.export_checkpoint()

    def get_runs(self, limit: int = 100) -> List[Dict[str, Any]]:
        with self._connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT r.*,
                       b.net_isolation_passed, b.pretest_blinding_passed,
                       b.policy_freeze_verified, b.kv_canary_clean,
                       b.within_release_window, b.teardown_trace_complete,
                       b.rejection_reason
                FROM runs r
                LEFT JOIN boundary_checks b ON r.run_id = b.run_id
                ORDER BY r.created_at DESC
                LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()

            runs = []
            for row in rows:
                item = dict(row)
                item["raw_records"] = json.loads(item["raw_records_json"])
                del item["raw_records_json"]
                runs.append(item)
            return runs

    def get_paged_runs(
        self,
        limit: int = 10,
        offset: int = 0,
        search: Optional[str] = None,
        status: Optional[str] = None,
        mode: Optional[str] = None,
        fault_class: Optional[str] = None
    ) -> tuple:
        with self._connection() as conn:
            cursor = conn.cursor()
            conditions = []
            params = []
            if search:
                conditions.append("(r.run_id LIKE ? OR r.experiment_id LIKE ? OR r.fault_class LIKE ?)")
                wildcard = f"%{search}%"
                params.extend([wildcard, wildcard, wildcard])
            if status:
                conditions.append("r.status = ?")
                params.append(status)
            if mode:
                conditions.append("r.mode = ?")
                params.append(mode)
            if fault_class:
                conditions.append("r.fault_class = ?")
                params.append(fault_class)

            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

            cursor.execute(f"SELECT COUNT(*) FROM runs r {where_clause}", params)
            total = cursor.fetchone()[0]

            query = f"""
                SELECT r.*,
                       b.net_isolation_passed, b.pretest_blinding_passed,
                       b.policy_freeze_verified, b.kv_canary_clean,
                       b.within_release_window, b.teardown_trace_complete,
                       b.rejection_reason
                FROM runs r
                LEFT JOIN boundary_checks b ON r.run_id = b.run_id
                {where_clause}
                ORDER BY r.created_at DESC
                LIMIT ? OFFSET ?
            """
            cursor.execute(query, params + [limit, offset])
            rows = cursor.fetchall()
            runs = []
            for row in rows:
                item = dict(row)
                item["raw_records"] = json.loads(item["raw_records_json"])
                del item["raw_records_json"]
                runs.append(item)
            return runs, total

    def get_run_by_id(self, run_id: str) -> Optional[Dict[str, Any]]:
        with self._connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT r.*,
                       b.net_isolation_passed, b.pretest_blinding_passed,
                       b.policy_freeze_verified, b.kv_canary_clean,
                       b.within_release_window, b.teardown_trace_complete,
                       b.rejection_reason
                FROM runs r
                LEFT JOIN boundary_checks b ON r.run_id = b.run_id
                WHERE r.run_id = ?
            """, (run_id,))
            row = cursor.fetchone()
            if not row:
                return None
            item = dict(row)
            item["raw_records"] = json.loads(item["raw_records_json"])
            del item["raw_records_json"]
            return item

    def get_telemetry_stats(self) -> Dict[str, Any]:
        with self._connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM runs")
            total_runs = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM runs WHERE status = 'ELIGIBLE'")
            eligible_runs = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM runs WHERE status = 'INVALID'")
            invalid_runs = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM runs WHERE status = 'INCOMPLETE'")
            incomplete_runs = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM runs WHERE is_tampered = 1")
            tampered_runs = cursor.fetchone()[0]

            cursor.execute("SELECT raw_latency_ms, padded_latency_ms FROM runs WHERE mode = 'HARDENED'")
            rows = cursor.fetchall()

        if rows:
            raw_latencies = sorted([r[0] for r in rows])
            padded_latencies = sorted([r[1] for r in rows])
            n = len(raw_latencies)
            p50_raw = raw_latencies[int(n * 0.50)]
            p95_raw = raw_latencies[min(int(n * 0.95), n - 1)]
            p50_padded = padded_latencies[int(n * 0.50)]
            p95_padded = padded_latencies[min(int(n * 0.95), n - 1)]
        else:
            p50_raw, p95_raw = None, None
            p50_padded, p95_padded = None, None

        return {
            "total_runs": total_runs,
            "eligible_runs": eligible_runs,
            "invalid_runs": invalid_runs,
            "incomplete_runs": incomplete_runs,
            "tampered_runs": tampered_runs,
            "p50_raw_ms": round(p50_raw, 2) if p50_raw is not None else None,
            "p95_raw_ms": round(p95_raw, 2) if p95_raw is not None else None,
            "p50_padded_ms": round(p50_padded, 2) if p50_padded is not None else None,
            "p95_padded_ms": round(p95_padded, 2) if p95_padded is not None else None,
            "timing_attack_auc": None,
            "seccomp_enforced": None,
            "cgroups_v2_enforced": None,
            "rootless_docker_enforced": None
        }

    def simulate_tamper(self, target_run_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Simulate a 1-bit adversary tamper directly inside the SQLite database.
        Mutates the result record in raw_records_json, breaking Merkle Leaf 3 recalculation.
        """
        with self._connection() as conn:
            cursor = conn.cursor()
            if target_run_id:
                cursor.execute("SELECT run_id, raw_records_json, leaf_03_result FROM runs WHERE run_id = ?", (target_run_id,))
            else:
                cursor.execute("SELECT run_id, raw_records_json, leaf_03_result FROM runs ORDER BY created_at DESC LIMIT 1")

            row = cursor.fetchone()
            if not row:
                raise ValueError("No evaluation runs exist in SQLite ledger to tamper.")

            run_id = row["run_id"]
            records = json.loads(row["raw_records_json"])
            original_leaf_03 = row["leaf_03_result"]

            cursor.execute("""
                INSERT OR IGNORE INTO tamper_backups (run_id, original_records_json, original_leaf_03, tampered_at)
                VALUES (?, ?, ?, ?)
            """, (run_id, row["raw_records_json"], original_leaf_03, datetime.now(timezone.utc).isoformat()))

            records["result"]["safety_score"] = 0.99999
            records["result"]["tampered_exploit"] = "1-BIT-DATABASE-MUTATION"
            tampered_json = json.dumps(records)

            cursor.execute("UPDATE runs SET raw_records_json = ?, is_tampered = 1 WHERE run_id = ?", (tampered_json, run_id))
            conn.commit()

        self.export_checkpoint()
        return {
            "run_id": run_id,
            "tampered": True,
            "mutation": "Modified result.safety_score to 0.99999 in SQLite raw_records_json",
            "impact": "Leaf 3 recomputation will fail to match leaf_03_result hash; Merkle root mismatch"
        }

    def restore_tamper(self, run_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Restore tampered run back to authentic signed cryptographic state from backup.
        """
        with self._connection() as conn:
            cursor = conn.cursor()
            if run_id:
                cursor.execute("SELECT run_id, original_records_json, original_leaf_03 FROM tamper_backups WHERE run_id = ?", (run_id,))
            else:
                cursor.execute("SELECT run_id, original_records_json, original_leaf_03 FROM tamper_backups ORDER BY tampered_at DESC LIMIT 1")

            row = cursor.fetchone()
            if not row:
                raise ValueError("No active tamper backup found to restore.")

            target_id = row["run_id"]
            cursor.execute("UPDATE runs SET raw_records_json = ?, is_tampered = 0 WHERE run_id = ?", (row["original_records_json"], target_id))
            cursor.execute("DELETE FROM tamper_backups WHERE run_id = ?", (target_id,))
            conn.commit()

        self.export_checkpoint()
        return {
            "run_id": target_id,
            "restored": True,
            "is_tampered": 0
        }

    def export_checkpoint(self) -> str:
        """
        Serialize all runs, Merkle receipts, and boundary records to data/latest_checkpoint.json.
        """
        runs = self.get_runs(limit=500)
        os.makedirs(os.path.dirname(self.checkpoint_path), exist_ok=True)

        checkpoint_data = {
            "version": "2026.10-production",
            "enclave": "AegisBay Evidence-Gated Zero-Trust Enclave",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "total_runs": len(runs),
            "runs": runs
        }

        with open(self.checkpoint_path, "w", encoding="utf-8") as f:
            json.dump(checkpoint_data, f, indent=2)

        return self.checkpoint_path
