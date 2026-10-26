import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader, Panel, Status } from "@/components/dash";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "Model Registry · Tensorline ML Ops" },
      { name: "description", content: "Versioned catalog of ML and scientific ML models with stage, metrics and lineage." },
      { property: "og:title", content: "Model Registry · Tensorline ML Ops" },
      { property: "og:description", content: "Versioned catalog of ML and scientific ML models with stage, metrics and lineage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Registry,
});

type Tone = "success" | "warning" | "info" | "muted";
const models: { name: string; type: string; version: string; stage: string; tone: Tone; metric: string; params: string; framework: string; updated: string }[] = [
  { name: "governance-guardrail-aims", type: "EU AI Act Compliance Engine", version: "v1.2.0", stage: "production", tone: "success", metric: "Risk Mit. 99.8%", params: "—", framework: "ISO 42001 Core", updated: "2m" },
  { name: "enterprise-rag-orchestrator", type: "Semantic Vector Pipeline", version: "v2.0.4", stage: "production", tone: "success", metric: "nDCG@10 0.892", params: "—", framework: "Python / AWS", updated: "12m" },
  { name: "cloud-autoscaler-fleet", type: "Elastic Infrastructure Script", version: "v1.0.0", stage: "production", tone: "success", metric: "Uptime 99.99%", params: "—", framework: "AWS CloudFormation", updated: "1h" },
  { name: "boundary-check-agent", type: "Conversational Audit Validator", version: "v0.9.4", stage: "canary", tone: "info", metric: "p95 Latency 45ms", params: "7B", framework: "PyTorch", updated: "32m" },
  { name: "heat-transfer-pinn", type: "Physics-Informed Neural Net", version: "v0.9.2", stage: "staging", tone: "warning", metric: "residual 3.2e-4", params: "1.1M", framework: "PyTorch", updated: "5h" },
  { name: "demand-forecast-tft", type: "Time series simulation", version: "v3.0.3", stage: "staging", tone: "warning", metric: "MAPE 6.4%", params: "38M", framework: "PyTorch", updated: "3h" },
  { name: "molecular-gnn", type: "Graph NN Model", version: "v0.4.0", stage: "archived", tone: "muted", metric: "MAE 0.041 eV", params: "4.6M", framework: "JAX", updated: "21d" },
];

function Registry() {
  const counts = ["production", "canary", "staging", "archived"].map((s) => [s, models.filter((m) => m.stage === s).length] as const);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Catalog" title="Model Registry" desc="Versioned models, lifecycle stage and headline evaluation metric." />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
        {counts.map(([s, c]) => (
          <div key={s} className="bg-card p-4">
            <p className="text-xs capitalize text-muted-foreground">{s}</p>
            <p className="num mt-1 text-2xl font-medium">{c}</p>
          </div>
        ))}
      </div>
      <Panel title="Registered models" meta={`${models.length} total`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>{["Model", "Type", "Version", "Stage", "Metric", "Params", "Framework", "Updated"].map((h) => <th key={h} className="pb-3 pr-4 font-normal">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {models.map((m) => (
                <tr key={m.name} className="transition-colors hover:bg-accent/50">
                  <td className="num py-3 pr-4 text-xs font-medium">{m.name}</td>
                  <td className="pr-4 text-muted-foreground">{m.type}</td>
                  <td className="num pr-4 text-xs">{m.version}</td>
                  <td className="pr-4"><Status tone={m.tone}>{m.stage}</Status></td>
                  <td className="num pr-4 text-xs">{m.metric}</td>
                  <td className="num pr-4 text-xs text-muted-foreground">{m.params}</td>
                  <td className="pr-4 text-muted-foreground">{m.framework}</td>
                  <td className="num text-xs text-muted-foreground">{m.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <GovernanceAuditor />
    </div>
  );
}

interface AuditCheck {
  id: string;
  label: string;
  detail: string;
}

const auditChecks: AuditCheck[] = [
  { id: "GOV-001", label: "PII Data Redaction Boundary", detail: "pii-scrubber v4 · 0 leaks / 1.2M tokens" },
  { id: "GOV-002", label: "Model Drift Threshold Validation", detail: "PSI 0.018 · threshold 0.20" },
  { id: "GOV-003", label: "Toxicity Bias Filter Check", detail: "7 demographic slices · max delta 0.9%" },
  { id: "GOV-004", label: "Training Data Consent Scope", detail: "provenance ledger · 100% attributed" },
  { id: "GOV-005", label: "Feature Lineage Provenance", detail: "214 features · lineage resolved" },
  { id: "GOV-006", label: "Explainability Report Signature", detail: "SHAP report · signed, unexpired" },
  { id: "GOV-007", label: "Adversarial Robustness Probe", detail: "1k perturbations · 99.4% stable" },
  { id: "GOV-008", label: "Output Logging Retention Policy", detail: "audit trail · 365d retention" },
];

function formatStamp() {
  const d = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}Z`;
}

function GovernanceAuditor() {
  const [rows, setRows] = useState<(AuditCheck & { ts: string })[]>([]);
  const streaming = rows.length < auditChecks.length;

  useEffect(() => {
    const i = rows.length;
    if (i >= auditChecks.length) {
      const restart = setTimeout(() => setRows([]), 6000);
      return () => clearTimeout(restart);
    }
    const tick = setTimeout(() => {
      setRows((r) => (r.length === i ? [...r, { ...auditChecks[i]!, ts: formatStamp() }] : r));
    }, i === 0 ? 700 : 800);
    return () => clearTimeout(tick);
  }, [rows]);

  return (
    <Panel
      title="AI Governance Auditor"
      meta={
        <span className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-success ${streaming ? "animate-ping opacity-75" : "opacity-0"}`} />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <span>governance/audit.stream · {streaming ? "running" : "complete"}</span>
        </span>
      }
    >
      <div className="rounded-md border border-border bg-background p-3">
        <div className="num mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>tensorline@audit-eu-west-1:~$ governance scan --scope production</span>
          <span>{rows.length}/{auditChecks.length} checks</span>
        </div>
        <div className="min-h-[21rem] space-y-1.5">
          {rows.map((r) => (
            <div key={r.id} className="num flex items-center gap-3 rounded px-1.5 py-1 text-xs animate-in fade-in slide-in-from-bottom-1 duration-300">
              <span className="text-[11px] text-muted-foreground">{r.ts}</span>
              <span className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-success/40 bg-success/15">
                <Check className="size-3 text-success" strokeWidth={3} />
              </span>
              <span className="text-muted-foreground">{r.id}</span>
              <span className="truncate">{r.label}</span>
              <span className="ml-auto hidden shrink-0 text-[11px] text-muted-foreground md:inline">{r.detail}</span>
              <Status tone="success">PASS</Status>
            </div>
          ))}
          {streaming && (
            <div className="num flex items-center gap-2 px-1.5 py-1 text-xs text-muted-foreground">
              <span className="inline-block h-3.5 w-1.5 animate-pulse bg-success" />
              <span>evaluating next control…</span>
            </div>
          )}
          {!streaming && (
            <div className="num px-1.5 py-1 text-xs text-success">
              ✓ {auditChecks.length}/{auditChecks.length} controls passed — next scan queued
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
