import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Database, Globe, Network, Server, X } from "lucide-react";
import { PageHeader, Panel, Status } from "@/components/dash";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/topology")({
  head: () => ({
    meta: [
      { title: "Network Topology · Tensorline ML Ops" },
      { name: "description", content: "Multi-region AWS availability zone topology for compute, gateways and vector indexes." },
      { property: "og:title", content: "Network Topology · Tensorline ML Ops" },
      { property: "og:description", content: "Multi-region AWS availability zone topology for compute, gateways and vector indexes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Topology,
});

type NodeType = "compute" | "gateway" | "vector";
type NodeState = "success" | "warning" | "destructive";

interface TopoNode {
  id: string;
  type: NodeType;
  name: string;
  state: NodeState;
  stateLabel: string;
  specs: [string, string][];
  description: string;
}

const typeIcon: Record<NodeType, typeof Server> = {
  compute: Cpu,
  gateway: Network,
  vector: Database,
};

const typeLabel: Record<NodeType, string> = {
  compute: "EC2 Compute Cluster",
  gateway: "API Gateway",
  vector: "Vector Index",
};

const nodes: TopoNode[] = [
  {
    id: "edge-global",
    type: "gateway",
    name: "edge-global-router",
    state: "success",
    stateLabel: "healthy",
    description: "Global entry point. TLS termination, WAF filtering and latency-based routing into regional API gateways.",
    specs: [
      ["Service", "CloudFront + Route 53"],
      ["Edge locations", "48 active"],
      ["TLS", "TLS 1.3 · HSTS enforced"],
      ["WAF", "Managed rules · 0 blocks/1h"],
      ["Avg route latency", "11 ms"],
      ["Failover", "Active-active both regions"],
    ],
  },
  {
    id: "use1-gw",
    type: "gateway",
    name: "api-gw-us-east-1",
    state: "success",
    stateLabel: "healthy",
    description: "Regional REST gateway fronting inference endpoints. Request validation, throttling and auth at the edge of the VPC.",
    specs: [
      ["Service", "API Gateway (regional)"],
      ["Requests / sec", "8.2k sustained"],
      ["Throttle limit", "12k rps burst"],
      ["p50 / p99", "6 ms / 24 ms"],
      ["Integration", "ALB → EKS inference pods"],
      ["Auth", "JWT authorizer · mTLS internal"],
    ],
  },
  {
    id: "use1a-compute",
    type: "compute",
    name: "ec2-p4de-us-east-1a",
    state: "warning",
    stateLabel: "hot",
    description: "Primary A100 inference cluster. Serving production ranking and PINN solvers; running hot on utilization.",
    specs: [
      ["Instance", "p4d.24xlarge"],
      ["Nodes", "6 / 8 in service"],
      ["GPUs", "24× A100 40GB (2 idle)"],
      ["vCPU / RAM", "768 vCPU · 4.6 TB"],
      ["EBS", "64 TB gp3 · 12,000 IOPS"],
      ["Util / Temp", "92% · 74°C"],
      ["Networking", "100 Gbps EFA enabled"],
    ],
  },
  {
    id: "use1b-compute",
    type: "compute",
    name: "ec2-p4de-us-east-1b",
    state: "success",
    stateLabel: "healthy",
    description: "Mirrored A100 inference cluster in the second AZ. Takes overflow traffic and handles batch scoring jobs.",
    specs: [
      ["Instance", "p4d.24xlarge"],
      ["Nodes", "4 / 4 in service"],
      ["GPUs", "16× A100 40GB"],
      ["vCPU / RAM", "512 vCPU · 3.1 TB"],
      ["EBS", "40 TB gp3 · 12,000 IOPS"],
      ["Util / Temp", "81% · 66°C"],
      ["Networking", "100 Gbps EFA enabled"],
    ],
  },
  {
    id: "use1-vector",
    type: "vector",
    name: "vec-index-us-east-1",
    state: "success",
    stateLabel: "healthy",
    description: "Primary HNSW vector index backing RAG retrieval for production assistants. Cross-region replicated to eu-west-1.",
    specs: [
      ["Engine", "OpenSearch 2.11 (k-NN)"],
      ["Vectors", "148M · 768-dim"],
      ["Index type", "HNSW · ef_search 128"],
      ["Storage", "2.4 TB gp3"],
      ["p95 query latency", "18 ms"],
      ["Replication", "async → eu-west-1 · 2.1s lag"],
    ],
  },
  {
    id: "eu1-gw",
    type: "gateway",
    name: "api-gw-eu-west-1",
    state: "success",
    stateLabel: "healthy",
    description: "European regional gateway serving EMEA traffic with data residency pinned to EU infrastructure.",
    specs: [
      ["Service", "API Gateway (regional)"],
      ["Requests / sec", "4.1k sustained"],
      ["Throttle limit", "8k rps burst"],
      ["p50 / p99", "7 ms / 26 ms"],
      ["Integration", "ALB → EKS inference pods"],
      ["Auth", "JWT authorizer · mTLS internal"],
    ],
  },
  {
    id: "eu1a-compute",
    type: "compute",
    name: "ec2-p5-eu-west-1a",
    state: "success",
    stateLabel: "healthy",
    description: "European GPU cluster for EMEA inference plus fine-tuning workloads scheduled in off-peak windows.",
    specs: [
      ["Instance", "p5.48xlarge"],
      ["Nodes", "3 / 3 in service"],
      ["GPUs", "24× H100 80GB"],
      ["vCPU / RAM", "576 vCPU · 9.6 TB"],
      ["EBS", "72 TB io2 · 32,000 IOPS"],
      ["Util / Temp", "74% · 61°C"],
      ["Networking", "100 Gbps EFA enabled"],
    ],
  },
  {
    id: "eu1b-compute",
    type: "compute",
    name: "ec2-p5-eu-west-1b",
    state: "destructive",
    stateLabel: "offline",
    description: "Second European AZ. Currently offline pending capacity restoration after a power event; traffic re-routed to 1a.",
    specs: [
      ["Instance", "p5.48xlarge"],
      ["Nodes", "0 / 3 in service"],
      ["GPUs", "24× H100 80GB (halted)"],
      ["vCPU / RAM", "576 vCPU · 9.6 TB"],
      ["EBS", "72 TB io2 · detached"],
      ["Last seen", "14h 22m ago"],
      ["Incident", "INFRA-2291 · power event"],
    ],
  },
  {
    id: "eu1-vector",
    type: "vector",
    name: "vec-index-eu-west-1",
    state: "success",
    stateLabel: "healthy",
    description: "Read replica of the primary vector index for EMEA retrieval queries, keeping EU user data in-region.",
    specs: [
      ["Engine", "OpenSearch 2.11 (k-NN)"],
      ["Vectors", "148M · 768-dim (replica)"],
      ["Index type", "HNSW · ef_search 128"],
      ["Storage", "2.4 TB gp3"],
      ["p95 query latency", "21 ms"],
      ["Replication lag", "2.1s behind primary"],
    ],
  },
];

const byId = new Map(nodes.map((n) => [n.id, n]));

function RegionColumn({
  region,
  regionName,
  azs,
  className,
}: {
  region: string;
  regionName: string;
  azs: { az: string; ids: string[] }[];
  className?: string;
}) {
  return (
    <Panel title={region} meta={regionName} className={className}>
      <div className="grid gap-4 md:grid-cols-2">
        {azs.map(({ az, ids }) => (
          <div key={az} className="rounded-md border border-dashed border-border bg-muted/30 p-3">
            <p className="num mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">{az}</p>
            <div className="space-y-2">
              {ids.map((id) => {
                const node = byId.get(id);
                if (!node) return null;
                return <NodeCard key={id} node={node} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NodeCard({ node }: { node: TopoNode }) {
  const Icon = typeIcon[node.type];
  return (
    <NodeCardButton node={node}>
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded border",
            node.state === "success" && "border-success/30 bg-success/10 text-success",
            node.state === "warning" && "border-warning/30 bg-warning/10 text-warning",
            node.state === "destructive" && "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="num truncate text-xs font-medium">{node.name}</p>
          <p className="text-[11px] text-muted-foreground">{typeLabel[node.type]}</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <Status tone={node.state}>{node.stateLabel}</Status>
        <span className="num text-[10px] uppercase tracking-widest text-muted-foreground">specs ↗</span>
      </div>
    </NodeCardButton>
  );
}

function NodeCardButton({ node, children }: { node: TopoNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/50"
      >
        {children}
      </button>
      <SpecsModal node={node} open={open} onOpenChange={setOpen} />
    </>
  );
}

function SpecsModal({ node, open, onOpenChange }: { node: TopoNode; open: boolean; onOpenChange: (v: boolean) => void }) {
  const Icon = typeIcon[node.type];
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div
        className={cn(
          "relative w-full max-w-md rounded-lg border border-border bg-popover shadow-lg transition-transform",
          open ? "scale-100" : "scale-95",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded border border-border bg-muted text-primary">
              <Icon className="size-4" />
            </div>
            <div>
              <p className="num text-xs font-medium">{node.name}</p>
              <p className="text-[11px] text-muted-foreground">{typeLabel[node.type]}</p>
            </div>
          </div>
          <button type="button" onClick={() => onOpenChange(false)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="size-4" />
          </button>
        </header>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          <Status tone={node.state}>{node.stateLabel}</Status>
          <p className="mt-3 text-sm text-muted-foreground">{node.description}</p>
          <dl className="mt-4 divide-y divide-border rounded-md border border-border">
            {node.specs.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 px-3 py-2 text-xs">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="num text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Topology() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Infrastructure"
        title="Network Topology"
        desc="Multi-region AWS topology — click any node card to inspect its infrastructure specifications."
        right={<Status tone="success">2 regions · 4 AZs</Status>}
      />
      <Panel title="edge-global-router" meta="global entry · anycast">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-success/30 bg-success/10 text-success">
            <Globe className="size-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            Global edge routing layer — terminates TLS, applies WAF rules and steers traffic to the nearest healthy regional gateway.
          </p>
        </div>
      </Panel>
      <div className="grid gap-6 xl:grid-cols-2">
        <RegionColumn
          region="us-east-1"
          regionName="N. Virginia · primary"
          azs={[
            { az: "us-east-1a", ids: ["use1-gw", "use1a-compute"] },
            { az: "us-east-1b", ids: ["use1b-compute", "use1-vector"] },
          ]}
        />
        <RegionColumn
          region="eu-west-1"
          regionName="Ireland · secondary"
          azs={[
            { az: "eu-west-1a", ids: ["eu1-gw", "eu1a-compute"] },
            { az: "eu-west-1b", ids: ["eu1b-compute", "eu1-vector"] },
          ]}
        />
      </div>
    </div>
  );
}
