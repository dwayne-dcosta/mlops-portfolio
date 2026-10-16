import { createFileRoute } from "@tanstack/react-router";
import { GitCommit } from "lucide-react";
import { PageHeader, Panel, Status } from "@/components/dash";

export const Route = createFileRoute("/deployments")({
  head: () => ({
    meta: [
      { title: "Deployment Feed · Tensorline ML Ops" },
      { name: "description", content: "Chronological feed of model rollouts, canaries and rollbacks across environments." },
      { property: "og:title", content: "Deployment Feed · Tensorline ML Ops" },
      { property: "og:description", content: "Chronological feed of model rollouts, canaries and rollbacks across environments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Feed,
});

type Tone = "success" | "warning" | "destructive" | "info";
const events: { time: string; model: string; version: string; env: string; status: string; tone: Tone; author: string; sha: string; note: string }[] = [
  { time: "2m ago", model: "fraud-detector-xgb", version: "v4.12.0", env: "prod", status: "canary 10%", tone: "info", author: "a.rao", sha: "9f3c21a", note: "Recalibrated thresholds on Q3 drift window." },
  { time: "18m ago", model: "navier-stokes-fno", version: "v2.3.1", env: "prod", status: "succeeded", tone: "success", author: "k.mehta", sha: "1b77e0d", note: "Fourier modes 32→48; residual improved 14%." },
  { time: "1h ago", model: "llm-reranker-7b", version: "v1.8.0", env: "staging", status: "succeeded", tone: "success", author: "s.chen", sha: "c04a9be", note: "INT8 quantization, p95 latency −22ms." },
  { time: "3h ago", model: "demand-forecast-tft", version: "v3.0.4", env: "prod", status: "rolled back", tone: "destructive", author: "a.rao", sha: "77de10f", note: "MAPE regression > 2σ on EU segment. Auto-rollback." },
  { time: "5h ago", model: "heat-transfer-pinn", version: "v0.9.2", env: "staging", status: "validating", tone: "warning", author: "j.okafor", sha: "e2a8f43", note: "Boundary-condition loss weight sweep in progress." },
  { time: "Yesterday", model: "embeddings-e5-large", version: "v2.1.0", env: "prod", status: "succeeded", tone: "success", author: "s.chen", sha: "4d19c66", note: "Re-indexed 41M vectors with zero downtime." },
];

function Feed() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Releases" title="Deployment Feed" desc="Every rollout, canary and rollback — newest first." right={<span className="num text-xs text-muted-foreground">24 deploys · 7d · 96% success</span>} />
      <Panel title="Activity" meta="all environments">
        <ol className="relative">
          {events.map((e, i) => (
            <li key={e.sha} className="relative flex gap-4 pb-6 last:pb-0">
              {i < events.length - 1 && <span className="absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-px bg-border" />}
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                <GitCommit className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="num text-sm font-medium">{e.model}</span>
                  <span className="num text-xs text-muted-foreground">{e.version}</span>
                  <Status tone={e.tone}>{e.status}</Status>
                  <span className="num rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">{e.env}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{e.time}</span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{e.note}</p>
                <p className="num mt-1 text-[11px] text-muted-foreground/70">{e.author} · {e.sha}</p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
