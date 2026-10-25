import { useEffect, useState } from "react";
import { Check, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type ThemeId = "dark" | "paper" | "terminal";

interface ThemeProfile {
  id: ThemeId;
  htmlClass: string;
  name: string;
  desc: string;
  chip: string;
}

const themes: ThemeProfile[] = [
  {
    id: "dark",
    htmlClass: "dark",
    name: "Midnight MLOps",
    desc: "Deep slate production dark theme — the default.",
    chip: "chip-dark",
  },
  {
    id: "paper",
    htmlClass: "theme-paper",
    name: "Paper Review",
    desc: "Neutral light theme, typography-first and print-friendly.",
    chip: "chip-paper",
  },
  {
    id: "terminal",
    htmlClass: "theme-terminal",
    name: "Terminal GRN",
    desc: "High-contrast phosphor green. Monospaced throughout.",
    chip: "chip-terminal",
  },
];

const STORAGE_KEY = "tensorline-theme";

function applyTheme(id: ThemeId) {
  const profile = themes.find((t) => t.id === id) ?? themes[0];
  document.documentElement.className = profile.htmlClass;
}

export function ThemeSettingsButton() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("dark");

  useEffect(() => {
    let stored: ThemeId = "dark";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && themes.some((t) => t.id === raw)) stored = raw as ThemeId;
    } catch {
      // storage unavailable — keep default
    }
    applyTheme(stored);
    setTheme(stored);
  }, []);

  function select(id: ThemeId) {
    setTheme(id);
    applyTheme(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // storage unavailable — theme applies for this session only
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Display settings"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Settings className="size-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 border-l border-border bg-background p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="text-sm font-medium">Display Settings</SheetTitle>
          <p className="text-xs text-muted-foreground">Choose a palette profile for the dashboard.</p>
        </SheetHeader>
        <div className="flex flex-col gap-2 p-3">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => select(t.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors",
                theme === t.id
                  ? "border-primary/60 bg-accent/50"
                  : "border-border hover:border-primary/40 hover:bg-accent/30",
              )}
            >
              <div className={cn("chip mt-0.5 size-7 shrink-0 rounded border border-border", t.chip)}>
                <span className="chip-dot block size-2.5 rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
              </div>
              {theme === t.id && <Check className="mt-0.5 size-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
        <p className="num px-4 text-[10px] uppercase tracking-widest text-muted-foreground">
          preference saved locally
        </p>
      </SheetContent>
    </Sheet>
  );
}
