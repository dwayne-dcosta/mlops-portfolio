import { createFileRoute } from "@tanstack/react-router";
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
    </div>
  );
}
