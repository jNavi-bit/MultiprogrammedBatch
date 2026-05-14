"use client";

import {
  Activity,
  ChevronDown,
  CirclePause,
  CirclePlay,
  Globe,
  Monitor,
  Moon,
  Palette,
  Play,
  RotateCcw,
  Sun,
  Timer,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AnimatedInteger } from "@/components/motion/AnimatedInteger";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useSimulationStore } from "@/store/simulationStore";
import { cn } from "@/lib/utils";

function localeLabel(loc: string, get: (key: string) => string) {
  switch (loc) {
    case "es":
      return get("name_es");
    case "en":
      return get("name_en");
    case "de":
      return get("name_de");
    default:
      return loc.toUpperCase();
  }
}

function BarDivider() {
  return <Separator orientation="vertical" className="mx-0.5 h-9 shrink-0 self-center bg-border/80 sm:h-10" decorative />;
}

export function AppHeader() {
  const t = useTranslations("nav");
  const tt = useTranslations("theme");
  const tl = useTranslations("locale");
  const td = useTranslations("dashboard");
  const ts = useTranslations("setup");
  const tk = useTranslations("keys");

  const { setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const phase = useSimulationStore((s) => s.phase);
  const paused = useSimulationStore((s) => s.paused);
  const globalClock = useSimulationStore((s) => s.globalClock);
  const tickMs = useSimulationStore((s) => s.tickMs);
  const setTickMs = useSimulationStore((s) => s.setTickMs);
  const jobCount = useSimulationStore((s) => s.jobCount);
  const setJobCount = useSimulationStore((s) => s.setJobCount);
  const start = useSimulationStore((s) => s.start);
  const reset = useSimulationStore((s) => s.reset);
  const pause = useSimulationStore((s) => s.pause);
  const resume = useSimulationStore((s) => s.resume);

  const switchLocale = (next: string) => {
    void router.replace(pathname || "/", { locale: next });
  };

  const onStart = () => {
    start();
  };

  const statusTooltip =
    phase === "completed" ? td("statusCompleted") : paused ? td("statusPaused") : td("statusRunning");

  const statusIcon =
    phase === "completed" ? (
      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" aria-hidden />
    ) : paused ? (
      <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.45)]" aria-hidden />
    ) : (
      <span className="h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.45)]" aria-hidden />
    );

  const centerScroll = cn(
    "flex w-full min-w-0 max-w-full flex-nowrap items-center gap-1.5 sm:gap-2 md:gap-2.5",
    "justify-start sm:justify-center",
    "overflow-x-auto overflow-y-hidden overscroll-x-contain py-0.5 [-webkit-overflow-scrolling:touch]",
    "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/60",
    "scroll-pl-1 scroll-pr-1 sm:scroll-p-0",
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <div className="mx-auto grid min-h-13 w-full max-w-[min(100%,1680px)] min-w-0 grid-cols-1 items-center gap-y-2 px-3 py-3 sm:min-h-15 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-y-0 md:px-5 md:py-3.5">
        <div className="min-w-0 w-full max-w-full justify-self-center sm:w-auto sm:max-w-none sm:justify-self-start sm:border-r sm:border-border/60 sm:pr-4">
          <Link
            href="/"
            className="flex max-w-full items-center gap-3 rounded-lg text-foreground ring-offset-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/15">
              <Activity className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 text-center sm:text-left">
              <span className="block truncate text-sm font-bold tracking-tight md:text-base">{t("brand")}</span>
              <span className="mt-0.5 block text-balance text-xs font-medium leading-snug text-muted-foreground md:text-[13px]">
                {t("headerTitle")}
              </span>
            </span>
          </Link>
        </div>

        <div className="min-w-0 w-full max-w-full justify-self-stretch sm:w-auto sm:max-w-none sm:justify-self-center">
          <div className={centerScroll}>
            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              <div className="flex shrink-0 flex-col justify-center leading-none">
                <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {td("globalClock")}
                </span>
                <span
                  className="mt-1 font-mono text-base font-semibold tabular-nums tracking-tight text-foreground sm:text-lg md:text-xl"
                  aria-live="polite"
                >
                  <AnimatedInteger value={globalClock} emphasis />
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="flex h-9 w-9 shrink-0 cursor-default items-center justify-center rounded-full border border-border/80 bg-muted/40 text-muted-foreground ring-1 ring-inset ring-border/30 sm:h-10 sm:w-10"
                    aria-label={statusTooltip}
                  >
                    {statusIcon}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[220px] text-xs">
                  {statusTooltip}
                </TooltipContent>
              </Tooltip>
            </div>

            <BarDivider />

            <div className="flex shrink-0 items-center gap-1.5">
              <Label htmlFor="hdr-tick" className="sr-only">
                {td("tickLabel")}
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/25 text-muted-foreground sm:h-10 sm:w-10">
                    <Timer className="h-4 w-4" aria-hidden />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  {td("tickLabel")}
                </TooltipContent>
              </Tooltip>
              <Input
                id="hdr-tick"
                type="number"
                min={200}
                max={3000}
                step={50}
                className="h-9 w-18 shrink-0 px-1.5 text-center text-sm tabular-nums sm:h-10 sm:w-20 sm:px-2 md:w-24"
                value={tickMs}
                onChange={(e) => setTickMs(e.target.valueAsNumber)}
                aria-label={td("tickLabel")}
              />
            </div>

            <BarDivider />

            <div className="flex shrink-0 items-center gap-px sm:gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
                      onClick={pause}
                      disabled={phase !== "running" || paused}
                      aria-label={td("pause")}
                    >
                      <CirclePause className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{td("tooltipPause")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
                      onClick={resume}
                      disabled={phase === "completed" || !paused}
                      aria-label={td("resume")}
                    >
                      <CirclePlay className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{td("tooltipResume")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" onClick={reset} aria-label={td("back")}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{td("tooltipReset")}</TooltipContent>
              </Tooltip>
            </div>

            <BarDivider />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1 px-2 sm:h-10 sm:gap-1.5 sm:px-3" aria-label={ts("start")} type="button">
                  <Play className="h-3.5 w-3.5 shrink-0" />
                  <span className="max-sm:sr-only max-w-32 truncate sm:max-w-40 md:max-w-none">{ts("start")}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60 max-sm:hidden" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 p-3">
                <p className="text-xs font-medium text-foreground">{ts("jobsLabel")}</p>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  step={1}
                  className="mt-2 h-10"
                  value={jobCount}
                  onChange={(e) => setJobCount(e.target.valueAsNumber)}
                  disabled={phase === "running"}
                  aria-label={ts("jobsLabel")}
                />
                <Button className="mt-2 h-10 w-full" size="sm" onClick={onStart} disabled={phase === "running"}>
                  {ts("start")}
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>

            <BarDivider />

            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:inline">{tk("title")}</span>
              {(["e", "w", "p", "c"] as const).map((k) => (
                <Tooltip key={k}>
                  <TooltipTrigger asChild>
                    <kbd className="cursor-default rounded-md border border-border/90 bg-muted/50 px-1.5 py-1 font-mono text-[10px] font-semibold leading-none text-foreground shadow-sm">
                      {k.toUpperCase()}
                    </kbd>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs">
                    {tk(k)}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-0 shrink-0 flex-wrap items-center justify-center gap-2 border-t border-border/50 pt-2 sm:w-auto sm:flex-nowrap sm:justify-self-end sm:border-l sm:border-t-0 sm:border-border/60 sm:pl-4 sm:pt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 px-2 sm:h-10 sm:px-3" aria-label={tl("label")}>
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="max-w-28 truncate text-xs font-medium">{localeLabel(locale, tl)}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              {routing.locales.map((loc) => (
                <DropdownMenuItem key={loc} className="gap-2 text-sm" onClick={() => switchLocale(loc)}>
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {localeLabel(loc, tl)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" aria-label={tt("system")} suppressHydrationWarning>
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36 p-1">
              <DropdownMenuItem className="gap-2.5 py-2" onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                {tt("light")}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2.5 py-2" onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 shrink-0 text-indigo-400" aria-hidden />
                {tt("dark")}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2.5 py-2" onClick={() => setTheme("system")}>
                <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                {tt("system")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
