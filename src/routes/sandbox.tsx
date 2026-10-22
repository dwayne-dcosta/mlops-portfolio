import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, Panel, Status } from "@/components/dash";

export const Route = createFileRoute("/sandbox")({
  head: () => ({
    meta: [
      { title: "Model Sandbox · Tensorline ML Ops" },
      { name: "description", content: "Interactive training simulator — tune hyperparameters and watch the loss curve converge, underfit, overfit or diverge live." },
      { property: "og:title", content: "Model Sandbox · Tensorline ML Ops" },
      { property: "og:description", content: "Tune hyperparameters and watch the training loss curve respond live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Sandbox,
});

const EPOCHS = 60;

// --- pure simulation -------------------------------------------------------

// Deterministic pseudo-noise, keyed by epoch + params so the curve is stable
// across re-renders but shifts whenever any slider changes.
function noise(seed: number, epoch: number) {
  const x = Math.sin(seed * 12.9898 + epoch * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function simulate(lrSlider: number, batch: number, reg: number) {
  const lr = Math.pow(10, -5 + (lrSlider / 100) * 5); // 1e-5 .. 1.0
  const seed = lrSlider * 7.13 + Math.log2(batch) * 3.77 + reg * 11.7;
  const jitter = 0.09 / Math.sqrt(batch); // small batches = noisy curve

  const lrOpt = 1e-3;
  const lrRatio = Math.log10(lr / lrOpt); // 0 at the sweet spot
  // Convergence rate: fastest near the optimal LR, slower off-center.
  const rate = 0.32 / (1 + Math.abs(lrRatio) * 1.6);

  const diverged = lr > 0.08;
  const underfit = reg > 0.3;
  const overfit = reg < 0.02 && !diverged;
  // Underfitting raises the asymptotic floor; strong reg never settles low.
  const floor = underfit ? 0.35 + (reg - 0.3) * 2.4 : 0.012 + Math.abs(lrRatio) * 0.03;

  let divergeAt = 0;
  if (diverged) divergeAt = Math.max(4, Math.round(14 - Math.log10(lr / 0.08) * 8));

  const data = [] as { epoch: number; train: number; val: number }[];
  let train = 2.1;
  let val = 2.1;
  for (let e = 0; e < EPOCHS; e++) {
    if (diverged && e >= divergeAt) {
      const g = 1 + 0.22 * (e - divergeAt);
      train = 2.1 + (g - 1) * 1.4 + jitter * e;
      val = train + 0.1 * g;
    } else {
      const decay = Math.exp(-rate * (e + 1));
      train = floor + (2.1 - floor) * decay + noise(seed, e) * jitter;
      // Validation tracks training, lags slightly, and climbs when overfitting.
      const overfitLift = overfit ? Math.max(0, e - 22) * 0.028 : 0;
      val = floor * 1.06 + (2.15 - floor) * decay + noise(seed + 4.2, e) * jitter + overfitLift;
    }
    data.push({ epoch: e + 1, train: Math.max(0, train), val: Math.max(0, val) });
  }

  const last = data[data.length - 1];
  const bestVal = Math.min(...data.map((d) => d.val));
  const valGap = last.val - bestVal;
  const finalTrain = last.train;

  let state: { tone: "success" | "warning" | "destructive" | "info"; label: string };
  if (diverged) state = { tone: "destructive", label: "DIVERGED · lr > 8e-2" };
  else if (valGap > 0.25) state = { tone: "warning", label: "OVERFITTING" };
  else if (underfit || finalTrain > 0.6) state = { tone: "warning", label: "UNDERFITTING" };
  else if (finalTrain < 0.15) state = { tone: "success", label: "CONVERGED" };
  else state = { tone: "info", label: "TRAINING" };

  return { data, lr, finalTrain, bestVal, state, diverged, overfit, underfit };
}

// --- UI --------------------------------------------------------------------

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  hint?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="num text-xs text-foreground">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function fmtExp(n: number) {
  if (n >= 0.1) return n.toFixed(2);
  return n.toExponential(1);
}

function Sandbox() {
  const [lrSlider, setLrSlider] = useState(60); // ~1e-3 sweet spot
  const [batch, setBatch] = useState(64);
  const [reg, setReg] = useState(0.08);

  const sim = useMemo(() => simulate(lrSlider, batch, reg), [lrSlider, batch, reg]);
  const lr = Math.pow(10, -5 + (lrSlider / 100) * 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Simulation"
        title="Model Sandbox"
        desc="Tune hyperparameters and watch the synthetic training run respond in real time."
        right={<Status tone={sim.state.tone}>{sim.state.label}</Status>}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Panel title="Hyperparameters" meta="live">
          <div className="space-y-6">
            <Slider
              label="Learning Rate"
              value={lrSlider}
              min={0}
              max={100}
              step={1}
              display={fmtExp(lr)}
              hint="Log scale 1e-5 → 1.0 · sweet spot near 1e-3"
              onChange={setLrSlider}
            />
            <Slider
              label="Batch Size"
              value={batch}
              min={8}
              max={512}
              step={8}
              display={String(batch)}
              hint="Small batches add gradient noise to the curve"
              onChange={setBatch}
            />
            <Slider
              label="Regularization Weight"
              value={reg}
              min={0}
              max={1}
              step={0.01}
              display={reg.toFixed(2)}
              hint="< 0.02 risks overfit · > 0.3 caps capacity"
              onChange={setReg}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
            <div className="bg-card p-3">
              <p className="text-[11px] text-muted-foreground">Final train loss</p>
              <p className="num mt-1 text-lg font-medium">{sim.finalTrain.toFixed(4)}</p>
            </div>
            <div className="bg-card p-3">
              <p className="text-[11px] text-muted-foreground">Best val loss</p>
              <p className="num mt-1 text-lg font-medium">{sim.bestVal.toFixed(4)}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Training loss curve" meta={`run: sliders@${lrSlider}/${batch}/${reg.toFixed(2)} · ${EPOCHS} epochs`}>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sim.data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="epoch"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  stroke="var(--border)"
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  stroke="var(--border)"
                  tickLine={false}
                  tickFormatter={(v: number) => v.toFixed(1)}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.375rem",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                  formatter={(value: number) => value.toFixed(4)}
                />
                <Line
                  type="monotone"
                  dataKey="train"
                  name="train loss"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="val"
                  name="val loss"
                  stroke="var(--warning)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {sim.diverged
              ? "Learning rate too high — gradients exploded past the divergence point."
              : sim.overfit
                ? "Validation loss is climbing while training loss keeps falling — increase regularization."
                : sim.underfit
                  ? "Regularization is capping model capacity — the curve plateaus above a usable floor."
                  : "Training and validation losses track cleanly toward the floor."}
          </p>
        </Panel>
      </div>
    </div>
  );
}
