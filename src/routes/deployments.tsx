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
  { time: "2m ago", model: "governance-guardrail-aims", version: "v1.2.0", env: "prod", status: "succeeded", tone: "success", author: "d.dcosta", sha: "9f3c21a", note: "Validated model boundary safeguards against ISO/IEC 42001 and EU AI Act constraints." },
  { time: "18m ago", model: "enterprise-rag-orchestrator", version: "v2.0.4", env: "prod", status: "succeeded", tone: "success", author: "d.dcosta", sha: "1b77e0d", note: "Optimized multi-agent embedding search pipeline retrieval latency thresholds." },
  { time: "1h ago", model: "aws-autoscaler-fleet", version: "v1.0.0", env: "prod", status: "succeeded", tone: "success", author: "d.dcosta", sha: "c04a9be", note: "Provisioned automated scaling architecture via AWS CloudFormation templates." },
  { time: "3h ago", model: "boundary-check-agent", version: "v0.9.4", env: "prod", status: "canary 10%", tone: "info", author: "d.dcosta", sha: "77de10f", note: "Evaluating conversational compliance models on isolated enterprise test subset." },
  { time: "5h ago", model: "heat-transfer-pinn", version: "v0.9.2", env: "staging", status: "validating", tone: "warning", author: "d.dcosta", sha: "e2a8f43", note: "SciML boundary condition threshold weight calibration in progress." },
  { time: "Yesterday", model: "cloud-network-topology", version: "v1.0.0", env: "prod", status: "succeeded", tone: "success", author: "d.dcosta", sha: "4d19c66", note: "Initialized secure multi-region AWS VPC peering endpoints with zero downtime." },
];

// Mock LinkedIn profile data dump (raw payload → rendered below as a deployment log)
type ProfileDump = {
  profile: { name: string; headline: string; location: string; open_to_work: boolean };
  experience: { company: string; title: string; period: string; current: boolean; highlights: string[] }[];
  skills: string[];
};
const linkedInDump: ProfileDump[] = [
  {
    profile: {
      name: "Dwayne D'costa",
      headline: "AWS AI & ML Scholar '26 | AI Solutions & Governance Engineer | AWS Cloud & LLM Orchestration | ISO 42001 & EU AI Act Compliance",
      location: "Panaji, Goa, India",
      open_to_work: true,
    },
    experience: [
      {
        company: "Reinbold Saunabau",
        title: "AI Solutions & Governance Engineer",
        period: "2024 - present",
        current: true,
        highlights: [
          "Architecting production-grade retrieval-augmented generation (RAG) pipelines optimized for enterprise scale.",
          "Designing and deploying end-to-end automation ecosystems bridging conversational AI and legacy systems.",
          "Implementing technical risk mitigation frameworks aligned with international standards like the EU AI Act and ISO/IEC 42001 (AIMS)."
        ]
      },
      {
        company: "AWS Nanodegree Core Infrastructure",
        title: "Cloud & Machine Learning Automation Systems",
        period: "2026",
        current: false,
        highlights: [
          "Completed specialized structural parameters for engineering highly scalable cloud deployments.",
          "Provisioned automated environment staging utilizing CloudFormation infrastructure scripts and secure IAM boundary parameters.",
          "Configured elastic computing clusters and continuous delivery components to manage operational inference spikes."
        ]
      }
    ],
    skills: [
      "AWS Cloud",
      "LLM Orchestration", 
      "RAG Pipelines", 
      "AI Governance", 
      "ISO 42001 Compliance", 
      "EU AI Act",
      "Python", 
      "Machine Learning", 
      "Automation Ecosystems",
      "Cloud Infrastructure"
    ]
  }
];

function ProfileLog() {
  const dump = linkedInDump[0]!;
  return (
    
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          linkedin/profile.dump · streaming
        </span>
      }
    >
      <div className="space-y-4">
        <div className="num rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          <p><span className="text-primary">{"{"} </span><span className="text-primary">"name":</span> <span className="text-foreground">"{dump.profile.name}"</span><span className="text-primary">,</span></p>
          <p><span className="text-primary">"headline":</span> <span className="text-foreground">"{dump.profile.headline}"</span><span className="text-primary">,</span></p>
          <p><span className="text-primary">"location":</span> <span className="text-foreground">"{dump.profile.location}"</span> <span className="text-primary">{"}"}</span></p>
        </div>
        <ol className="relative">
          {dump.experience.map((job, i) => (
            <li key={job.company} className="relative flex gap-4 pb-6 last:pb-0">
              {i < dump.experience.length - 1 && <span className="absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-px bg-border" />}
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                <GitCommit className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="num text-sm font-medium">{job.title.toLowerCase().replace(/ /g, "-")}</span>
                  <span className="num text-xs text-muted-foreground">@{job.company}</span>
                  {job.current ? (
                    <Status tone="success">ACTIVE</Status>
                  ) : (
                    <Status tone="muted">shipped</Status>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">{job.period}</span>
                </div>
                <ul className="mt-1.5 space-y-0.5">
                  {job.highlights.map((h) => (
                    <li key={h} className="text-sm text-muted-foreground">· {h}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
          <span className="num mr-1 text-[11px] uppercase tracking-widest text-muted-foreground">skills:</span>
          {dump.skills.map((s) => (
            <span key={s} className="num rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{s}</span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Feed() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Releases" title="Deployment Feed" desc="Every rollout, canary and rollback — newest first." right={<span className="num text-xs text-muted-foreground">24 deploys · 7d · 96% success</span>} />
      
      {/* Activity Panel (Full Width) */}
      <div className="w-full">
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
                    <span className="num rounded bg-muted/60 px-1 text-[11px] uppercase tracking-wide text-muted-foreground">{e.env}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{e.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{e.note}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="num">{e.author}</span>
                    <span>·</span>
                    <span className="num font-mono">{e.sha}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {/* Identity Stream Panel (Full Width Below) */}
      <div className="w-full">
        <ProfileLog />
      </div>
    </div>
  );
}
