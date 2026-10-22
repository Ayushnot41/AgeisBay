"use client";
import { ReactNode, useState } from "react";
import { Check, Copy, AlertCircle } from "lucide-react";
export function Panel({
  title,
  description,
  action,
  children,
  id,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="work-panel" id={id} aria-label={title}>
      <header className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {action && <div className="panel-actions">{action}</div>}
      </header>
      {children}
    </section>
  );
}
export function Status({ value }: { value: string }) {
  const tone = /^(ELIGIBLE|VERIFIED|PASS|CONFIGURED|CONTAINED)$/.test(value)
    ? "pass"
    : /^(INVALID|FAIL|TAMPER_DETECTED|FAILED)$/.test(value)
      ? "fail"
      : "neutral";
  return (
    <span className={`status-tag status-${tone}`}>
      <span aria-hidden="true" />
      {value.replaceAll("_", " ")}
    </span>
  );
}
export function ErrorNotice({ message }: { message: string | null }) {
  return message ? (
    <div className="error-notice" role="alert">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  ) : null;
}
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("Copied");
    } catch {
      setState("Copy unavailable; select the text manually.");
    }
  }
  return (
    <span>
      <button
        className="icon-button"
        onClick={copy}
        title={label}
        aria-label={label}
      >
        {state === "Copied" ? <Check size={15} /> : <Copy size={15} />}
      </button>
      <span className="sr-only" role="status">
        {state}
      </span>
    </span>
  );
}
