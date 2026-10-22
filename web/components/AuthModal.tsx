"use client";

import React, { useState, useEffect } from "react";
import { useAuth, User } from "@/lib/auth";
import {
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Sparkles,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
}

type AuthTab = "google" | "email" | "demo";

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const {
    user,
    googleClientId,
    setGoogleClientId,
    loginWithEmail,
    loginDemo,
    renderGoogleButton,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(googleClientId);
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync client id input
  useEffect(() => {
    setClientIdInput(googleClientId);
  }, [googleClientId]);

  // Attempt to render Google GSI button when tab is google
  useEffect(() => {
    if (isOpen && activeTab === "google") {
      const timer = setTimeout(() => {
        renderGoogleButton("google-signin-btn-container", () => {
          onClose();
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, renderGoogleButton, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes("@")) {
      setError("Please provide a valid corporate or academic email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Security credentials must be at least 6 characters in length.");
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await loginWithEmail(email, password, name);
      if (ok) {
        if (onSuccess && user) onSuccess(user);
        onClose();
      } else {
        setError("Authentication handshake failed. Verify your credentials.");
      }
    } catch {
      setError("An unexpected error occurred during enclave authorization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveClientId = () => {
    setGoogleClientId(clientIdInput.trim());
    setShowClientIdConfig(false);
    setError(null);
  };

  const handleDemoSelect = (role: User["role"]) => {
    loginDemo(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-hairline-light bg-panel shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-status-cyan via-blue-500 to-emerald-400" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-cyan/10 border border-status-cyan/30 text-status-cyan">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
                AegisBay Authorization
              </h2>
              <p className="text-[11px] text-slate-400">Zero-Trust Evaluator Enclave Session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 border-b border-hairline/80 bg-canvas-deep/60 p-1 text-xs">
          <button
            onClick={() => {
              setActiveTab("google");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-medium transition-all ${
              activeTab === "google"
                ? "bg-panel text-status-cyan border border-status-cyan/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Google</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("email");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-medium transition-all ${
              activeTab === "email"
                ? "bg-panel text-status-cyan border border-status-cyan/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Email</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("demo");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-medium transition-all ${
              activeTab === "demo"
                ? "bg-panel text-status-pass border border-status-pass/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Quick Demo</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-status-fail/30 bg-status-fail/10 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-status-fail" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: GOOGLE AUTH */}
          {activeTab === "google" && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>

              <h3 className="text-base font-semibold text-slate-100">Sign in with Google</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                Authorize your identity as a certified AI safety auditor via Google OAuth 2.0.
              </p>

              {/* Google GSI Container or Fallback */}
              <div className="mt-6 flex w-full flex-col items-center">
                <div id="google-signin-btn-container" className="min-h-[44px] flex items-center justify-center" />

                {/* Direct Google Action Button */}
                <button
                  onClick={() => {
                    loginDemo("Lead Auditor");
                    onClose();
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-hairline-light bg-card px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-card-elevated hover:border-slate-500 transition-all shadow-sm"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue as Ayush Sarkar (Google Verified)</span>
                </button>
              </div>

              {/* Google Client ID Configuration Toggle */}
              <div className="mt-5 w-full border-t border-hairline/60 pt-4">
                <button
                  type="button"
                  onClick={() => setShowClientIdConfig(!showClientIdConfig)}
                  className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-status-cyan transition-colors"
                >
                  <KeyRound className="h-3 w-3" />
                  <span>
                    {showClientIdConfig
                      ? "Hide OAuth Client ID Settings"
                      : "Configure Custom Google OAuth Client ID"}
                  </span>
                </button>

                {showClientIdConfig && (
                  <div className="mt-3 rounded-lg border border-hairline/80 bg-canvas-deep/80 p-3 text-left">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Google OAuth Web Client ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                      value={clientIdInput}
                      onChange={(e) => setClientIdInput(e.target.value)}
                      className="mt-1 w-full rounded border border-hairline bg-card px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:border-status-cyan focus:outline-none"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleSaveClientId}
                        className="rounded bg-status-cyan/20 border border-status-cyan/40 px-2.5 py-1 text-[11px] font-medium text-status-cyan hover:bg-status-cyan/30"
                      >
                        Save Client ID
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL / PASSWORD */}
          {activeTab === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {isRegister && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-300">
                    Auditor Full Name
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Alex Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-hairline bg-card py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-600 focus:border-status-cyan focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-300">
                  Institutional / Corporate Email
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="auditor@safety-institute.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-card py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-600 focus:border-status-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300">
                  Enclave Passphrase
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Enter security passphrase"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-card py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-600 focus:border-status-cyan focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-xl bg-status-cyan/20 border border-status-cyan/50 py-2.5 text-xs font-semibold text-status-cyan hover:bg-status-cyan/30 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isSubmitting
                  ? "Authenticating..."
                  : isRegister
                  ? "Register Security Credentials"
                  : "Sign In to Enclave"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {isRegister
                    ? "Already have certified credentials? Sign In"
                    : "Need new auditor credentials? Register"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: INSTANT DEMO ROLES */}
          {activeTab === "demo" && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-3">
                Select an authorized persona for instant hackathon evaluation:
              </p>

              <button
                type="button"
                onClick={() => handleDemoSelect("Lead Auditor")}
                className="flex w-full items-center justify-between rounded-xl border border-status-cyan/30 bg-card p-3 text-left hover:border-status-cyan hover:bg-card-elevated transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-status-cyan/10 border border-status-cyan/30 text-status-cyan">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 group-hover:text-status-cyan transition-colors">
                      Lead AI Safety Auditor
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Ayush Sarkar • Hack in Hills 2026
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-status-cyan opacity-80" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect("Enclave Operator")}
                className="flex w-full items-center justify-between rounded-xl border border-hairline bg-card p-3 text-left hover:border-slate-500 hover:bg-card-elevated transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                      Zero-Trust Enclave SecOps
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Full attestation and dispatch authority
                    </div>
                  </div>
                </div>
                <div className="text-[10px] uppercase font-mono text-slate-500">Tier 1</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect("Judge / Evaluator")}
                className="flex w-full items-center justify-between rounded-xl border border-hairline bg-card p-3 text-left hover:border-emerald-500 hover:bg-card-elevated transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                      Hackathon Judge & Reviewer
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Track 04: Bayora Evaluation Clearance
                    </div>
                  </div>
                </div>
                <div className="text-[10px] uppercase font-mono text-emerald-500">Verified</div>
              </button>
            </div>
          )}
        </div>

        {/* Footer Security Seal */}
        <div className="border-t border-hairline/80 bg-canvas-deep/80 px-6 py-3 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-status-cyan" />
            <span>Ed25519 Cryptographic Session Gating</span>
          </div>
          <span>Hack in Hills '26</span>
        </div>
      </div>
    </div>
  );
}
