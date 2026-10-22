import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PageHeader, Panel, Sparkline, Status } from "@/components/dash";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "System Health · Tensorline ML Ops" },
      { name: "description", content: "Live GPU, inference latency and pipeline health for production ML systems." },
      { property: "og:title", content: "System Health · Tensorline ML Ops" },
      { property: "og:description", content: "Live GPU, inference latency and pipeline health for production ML systems." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Health,
});

const kpis = [
  { label: "p95 inference latency", value: "42.8", unit: "ms", delta: "−3.1%", data: [52, 50, 48, 49, 46, 45, 47, 44, 43, 42] },
  { label: "GPU utilization", value: "78.4", unit: "%", delta: "+4.2%", data: [61, 64, 70, 68, 72, 75, 74, 77, 79, 78] },
  { label: "Requests / sec", value: "12.4k", unit: "", delta: "+11%", data: [8, 9, 9.5, 10, 10.2, 11, 11.4, 11.8, 12, 12.4] },
  { label: "Model Governance Audits", value: "100%", unit: "", delta: "0.0%", data: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9] },
];

const latency = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  p50: Math.round(18 + Math.sin(i / 3) * 4 + (i % 5)),
  p95: Math.round(40 + Math.sin(i / 3) * 8 + (i % 7)),
}));

const nodes = [
  { name: "aws-ec2-p4de-us-east-1a", util: 92, mem: 71, temp: 74, tone: "warning" as const, s: "hot" },
  { name: "aws-ec2-p4de-us-east-1b", util: 81, mem: 64, temp: 66, tone: "success" as const, s: "healthy" },
  { name: "aws-ec2-p5-eu-west-1a", util: 74, mem: 58, temp: 61, tone: "success" as const, s: "healthy" },
  { name: "aws-ec2-p5-eu-west-1b", util: 0, mem: 0, temp: 34, tone: "destructive" as const, s: "offline" },
  { name: "aws-trainium-trn1-us-west-2", util: 66, mem: 49, temp: 55, tone: "success" as const, s: "healthy" },
];

const services = [
  ["Compliance auditor", "success", "100.00%"], ["Inference gateway", "success", "99.97%"],
  ["Model telemetry stream", "success", "99.94%"], ["RAG vector database", "success", "99.98%"],
  ["Data ingestion (Kafka)", "info", "maint."],
] as const;

function Bar({ v }: { v: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
    </div>
  );
}

function Health() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Overview" title="System Health" desc="Compute, inference and solver health across all production regions." right={<Status tone="success">Live · 15s refresh</Status>} />
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="num text-2xl font-medium">{k.value}</span>
              <span className="num text-sm text-muted-foreground">{k.unit}</span>
              <span className="num ml-auto text-xs text-success">{k.delta}</span>
            </div>
            <Sparkline data={k.data} className="mt-3" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Inference latency" meta="last 24h · ms" className="xl:col-span-2">
          <ChartContainer config={{ p50: { label: "p50", color: "var(--chart-2)" }, p95: { label: "p95", color: "var(--chart-1)" } }} className="h-64 w-full">
            <AreaChart data={latency}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="t" tickLine={false} axisLine={false} interval={3} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} width={30} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="p95" type="monotone" stroke="var(--color-p95)" fill="var(--color-p95)" fillOpacity={0.12} />
              <Area dataKey="p50" type="monotone" stroke="var(--color-p50)" fill="var(--color-p50)" fillOpacity={0.12} />
            </AreaChart>
          </ChartContainer>
        </Panel>
        <Panel title="Services" meta="30d uptime">
          <ul className="divide-y divide-border">
            {services.map(([n, t, u]) => (
              <li key={n} className="flex items-center justify-between py-2.5 text-sm">
                <span>{n}</span>
                <Status tone={t}>{u}</Status>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Accelerator fleet" meta={`${nodes.length} nodes`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr><th className="pb-3 font-normal">Node</th><th className="pb-3 font-normal">Status</th><th className="w-40 pb-3 font-normal">Util</th><th className="w-40 pb-3 font-normal">Memory</th><th className="pb-3 text-right font-normal">Temp</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {nodes.map((n) => (
                <tr key={n.name}>
                  <td className="num py-3 text-xs">{n.name}</td>
                  <td><Status tone={n.tone}>{n.s}</Status></td>
                  <td className="pr-6"><div className="flex items-center gap-2"><Bar v={n.util} /><span className="num w-8 text-xs text-muted-foreground">{n.util}%</span></div></td>
                  <td className="pr-6"><div className="flex items-center gap-2"><Bar v={n.mem} /><span className="num w-8 text-xs text-muted-foreground">{n.mem}%</span></div></td>
                  <td className="num text-right text-xs">{n.temp}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
