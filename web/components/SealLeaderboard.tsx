"use client";

import React, { useState, useEffect } from "react";
import {
  getSealLeaderboard,
  getModelCertificate,
  ModelLeaderboardEntry,
  SealCertificate,
} from "@/lib/api";
import {
  Trophy,
  ShieldCheck,
  Lock,
  Download,
  Copy,
  Check,
  ExternalLink,
  Award,
  AlertTriangle,
  RotateCw,
  Search,
} from "lucide-react";

export default function SealLeaderboard() {
  const [models, setModels] = useState<ModelLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<SealCertificate | null>(null);
  const [certLoading, setCertLoading] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getSealLeaderboard();
      setModels(data);
      if (data.length > 0 && !selectedModel) {
        handleSelectModel(data[0].model_id);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = async (modelId: string) => {
    setSelectedModel(modelId);
    setCertLoading(true);
    try {
      const cert = await getModelCertificate(modelId);
      setCertificate(cert);
    } catch {
      // Silently catch
    } finally {
      setCertLoading(false);
    }
  };

  const filteredModels = models.filter((m) => {
    const matchesTier = tierFilter === "ALL" || m.tier === tierFilter;
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.vendor.toLowerCase().includes(search.toLowerCase()) ||
      m.model_id.toLowerCase().includes(search.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "PLATINUM":
        return "bg-accent/20 text-accent border-accent/40";
      case "GOLD":
        return "bg-status-warn/20 text-status-warn border-status-warn/40";
      case "SILVER":
        return "bg-card-elevated/20 text-body border-hairline-light/40";
      default:
        return "bg-status-fail/20 text-status-fail border-status-fail/40";
    }
  };

  const copyMarkdownBadge = () => {
    if (!certificate) return;
    const md = `[![AegisBay SEAL Certified](https://img.shields.io/badge/AegisBay_SEAL-${certificate.evaluation_scores.overall_safety_rating}%25_Safety-06B6D4?style=for-the-badge&logo=shield)](https://github.com/Ayushnot41/AgeisBay)`;
    navigator.clipboard.writeText(md);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  const downloadCertJson = () => {
    if (!certificate) return;
    const blob = new Blob([JSON.stringify(certificate, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aegisbay_seal_${certificate.model.model_id}_certificate.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-hairline-light bg-panel p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-status-cyan/30 bg-status-cyan/10 px-3 py-0.5 text-xs font-sans text-status-cyan">
              <Trophy className="h-3.5 w-3.5" />
              <span>SEAL evaluation protocol</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink">
              Model safety & SEAL attestations
            </h2>
            <p className="text-sm text-muted max-w-2xl">
              Blinded adversarial evaluations conducted inside the AegisBay zero-trust enclave.
              Models are evaluated against multi-vector jailbreaks, canary extraction probes, and
              side-channel timing variance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadLeaderboard}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-hairline bg-card px-3.5 py-2 text-xs font-medium text-body hover:text-ink hover:bg-card-elevated transition-all"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Ranks</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-hairline/80 pt-4 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-muted font-medium">Tier:</span>
            {["ALL", "PLATINUM", "GOLD", "VULNERABLE"].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  tierFilter === tier
                    ? "bg-status-cyan/20 text-status-cyan border border-status-cyan/40"
                    : "text-muted hover:text-ink"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search model or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-card py-1.5 pl-8 pr-3 text-xs text-ink placeholder-muted focus:border-status-cyan focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid: Leaderboard Table (Left 7 Cols) + Attestation Certificate (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaderboard Table */}
        <div className="lg:col-span-7 rounded-2xl border border-hairline bg-panel overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-canvas-deep/80 border-b border-hairline text-xs font-sans tracking-normal text-muted">
                <tr>
                  <th className="py-3 pl-4 pr-2">Rank</th>
                  <th className="py-3 px-3">Model & Vendor</th>
                  <th className="py-3 px-3 text-center">Safety Rating</th>
                  <th className="py-3 px-3 text-center">Jailbreak Imm.</th>
                  <th className="py-3 px-3 text-center">Timing AUC</th>
                  <th className="py-3 pr-4 pl-2 text-right">Attestation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/60">
                {filteredModels.map((m) => {
                  const isSelected = selectedModel === m.model_id;
                  return (
                    <tr
                      key={m.model_id}
                      onClick={() => handleSelectModel(m.model_id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-status-cyan/10 hover:bg-status-cyan/15"
                          : "hover:bg-card-elevated/60"
                      }`}
                    >
                      <td className="py-3.5 pl-4 pr-2 font-sans font-bold text-body">
                        <div className="flex items-center gap-1.5">
                          {m.rank === 1 && (
                            <Award className="h-4 w-4 text-status-warn shrink-0" />
                          )}
                          <span>#{m.rank}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-ink">{m.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted font-sans">
                          <span>{m.vendor}</span>
                          <span>•</span>
                          <span
                            className={`rounded px-1.5 py-0.2 border text-xs font-bold ${getTierBadge(
                              m.tier
                            )}`}
                          >
                            {m.tier}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-sans font-bold">
                        <span
                          className={
                            m.overall_safety_rating >= 95
                              ? "text-status-pass"
                              : m.overall_safety_rating >= 80
                              ? "text-status-warn"
                              : "text-status-fail"
                          }
                        >
                          {m.overall_safety_rating.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-sans text-body">
                        {m.jailbreak_resistance.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-3 text-center font-sans">
                        <span
                          className={
                            m.side_channel_timing_auc === 0.5
                              ? "text-status-cyan"
                              : "text-status-fail"
                          }
                        >
                          {m.side_channel_timing_auc.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 pl-2 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-sans border ${
                            m.status === "ATTESTED"
                              ? "bg-status-pass/10 text-status-pass border-status-pass/30"
                              : "bg-status-fail/10 text-status-fail border-status-fail/30"
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          <span>{m.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cryptographic Attestation Certificate Card */}
        <div className="lg:col-span-5 rounded-2xl border border-hairline-light bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-hairline/80 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-status-cyan" />
              <h3 className="text-xs font-sans tracking-normal text-ink">
                SEAL Attestation Certificate
              </h3>
            </div>
            <span className="text-xs font-sans text-muted">ED25519 VERIFIED</span>
          </div>

          {certLoading ? (
            <div className="py-12 text-center text-xs text-muted flex flex-col items-center gap-2">
              <RotateCw className="h-5 w-5 animate-spin text-status-cyan" />
              <span>Generating cryptographic attestation receipt...</span>
            </div>
          ) : certificate ? (
            <div className="space-y-4 font-sans text-xs">
              <div className="rounded-xl border border-status-cyan/30 bg-canvas-deep p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Certificate ID:</span>
                  <span className="text-status-cyan font-bold">
                    {certificate.certificate_id}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Target Model:</span>
                  <span className="text-ink font-semibold">
                    {certificate.model.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Model Digest:</span>
                  <span className="text-accent truncate max-w-[180px]">
                    {certificate.model.model_digest}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Enclave Notary:</span>
                  <span className="text-status-pass truncate max-w-[180px]">
                    {certificate.enclave_attestation.notary_fingerprint}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Audit Status:</span>
                  <span className="text-status-pass font-bold">
                    {certificate.enclave_attestation.audit_trail_status}
                  </span>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-hairline bg-panel p-2.5">
                  <div className="text-xs text-muted">Overall Safety</div>
                  <div className="text-base font-bold text-status-pass">
                    {certificate.evaluation_scores.overall_safety_rating}%
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-panel p-2.5">
                  <div className="text-xs text-muted">Jailbreak Immunity</div>
                  <div className="text-base font-bold text-accent">
                    {certificate.evaluation_scores.jailbreak_resistance_pct}%
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-panel p-2.5">
                  <div className="text-xs text-muted">Canary Immunity</div>
                  <div className="text-base font-bold text-accent">
                    {certificate.evaluation_scores.canary_leakage_immunity_pct}%
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-panel p-2.5">
                  <div className="text-xs text-muted">Side-Channel AUC</div>
                  <div className="text-base font-bold text-ink">
                    {certificate.evaluation_scores.side_channel_timing_auc.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={downloadCertJson}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-hairline bg-panel py-2 text-xs font-semibold text-ink hover:bg-card-elevated hover:border-hairline-light transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download JSON Cert</span>
                </button>
                <button
                  onClick={copyMarkdownBadge}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-status-cyan/20 border border-status-cyan/40 py-2 text-xs font-semibold text-status-cyan hover:bg-status-cyan/30 transition-all"
                >
                  {copiedBadge ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-status-pass" />
                      <span>Copied Badge!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Badge Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted">
              Select a model from the leaderboard to view its attestation certificate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
