"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ListOrdered,
  Package,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { AnimatedInteger } from "@/components/motion/AnimatedInteger";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatOperation } from "@/services/operationService";
import { cn } from "@/lib/utils";
import type { FinishedJob, SimJob } from "@/types/simulation";

export type ProcessCardMode = "pending-batch" | "queued" | "running" | "finished";

type Props = {
  job: SimJob;
  batchIndex: number;
  mode: ProcessCardMode;
  elapsed: number;
  finished?: FinishedJob;
};

export function ProcessInfoCard({ job, batchIndex, mode, elapsed, finished }: Props) {
  const tp = useTranslations("process");
  const tf = useTranslations("finished");

  const effectiveElapsed =
    mode === "finished" && finished?.reason === "normal" ? job.tme : Math.min(elapsed, job.tme);
  const remaining = Math.max(0, job.tme - effectiveElapsed);
  const pct = job.tme > 0 ? Math.min(100, (effectiveElapsed / job.tme) * 100) : 0;

  const opExpr = formatOperation(job);

  const resultDisplay: { text: string; tone: "ok" | "err" | "pending" } = (() => {
    if (mode === "finished" && finished?.reason === "error") {
      return { text: tf("error"), tone: "err" };
    }
    if (mode === "finished" && finished?.resultText !== undefined) {
      return { text: finished.resultText, tone: "ok" };
    }
    return { text: tp("resultPending"), tone: "pending" };
  })();

  const statusVariant =
    mode === "finished" && finished?.reason === "error"
      ? ("danger" as const)
      : mode === "running"
        ? ("primary" as const)
        : mode === "queued"
          ? ("outline" as const)
          : mode === "pending-batch"
            ? ("default" as const)
            : ("success" as const);

  const statusIcon =
    mode === "running" ? (
      <Cpu className="h-3.5 w-3.5" aria-hidden />
    ) : mode === "finished" && finished?.reason === "error" ? (
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
    ) : mode === "finished" ? (
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
    ) : mode === "queued" ? (
      <ListOrdered className="h-3.5 w-3.5" aria-hidden />
    ) : (
      <Package className="h-3.5 w-3.5" aria-hidden />
    );

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl border-2 border-border/85 bg-card/95 shadow-sm",
        mode === "running" && "ring-2 ring-primary/45 shadow-md shadow-primary/10",
      )}
    >
      <CardContent className="space-y-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={statusVariant} className="gap-1 px-2 py-0.5 text-[11px] font-semibold">
              {statusIcon}
              {mode === "finished" && finished?.reason === "error"
                ? tp("statusError")
                : mode === "finished"
                  ? tp("statusFinished")
                  : mode === "running"
                    ? tp("statusRunning")
                    : mode === "queued"
                      ? tp("statusQueued")
                      : tp("statusPendingBatch")}
            </Badge>
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
              {tp("batch")} {batchIndex + 1}
            </span>
            <span className="font-mono text-xs font-bold tabular-nums text-foreground">#{job.id}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground/80">{tp("kind")}</span>{" "}
            <span className="rounded-md bg-muted/80 px-1 py-0.5 font-mono text-[10px]">{job.kind}</span>
          </span>
        </div>

        <div className="rounded-lg border-2 border-dashed border-border/75 bg-muted/20 px-2.5 py-4 sm:py-5">
          <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {tp("operationAndResult")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1.5 text-center font-mono">
            <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg md:text-xl">
              {opExpr}
            </span>
            <span className="text-lg font-black text-primary sm:text-xl md:text-2xl" aria-hidden>
              =
            </span>
            <span
              className={cn(
                "text-base font-bold tabular-nums sm:text-lg md:text-xl",
                resultDisplay.tone === "ok" && "text-emerald-600 dark:text-emerald-400",
                resultDisplay.tone === "err" && "text-rose-600 dark:text-rose-400",
                resultDisplay.tone === "pending" && "text-muted-foreground",
              )}
            >
              {resultDisplay.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center sm:gap-2">
          <div className="rounded-md border border-border/80 bg-muted/15 px-1.5 py-2">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{tp("tme")}</p>
            <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground sm:text-base">{job.tme}</p>
          </div>
          <div className="rounded-md border border-border/80 bg-muted/15 px-1.5 py-2">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{tp("elapsed")}</p>
            <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground sm:text-base">
              <AnimatedInteger value={effectiveElapsed} />
            </p>
          </div>
          <div className="rounded-md border border-border/80 bg-muted/15 px-1.5 py-2">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{tp("remaining")}</p>
            <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-primary sm:text-base">
              <AnimatedInteger value={remaining} />
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium">{tp("cpuProgress")}</span>
            <span className="font-mono tabular-nums">{Math.round(pct)}%</span>
          </div>
          <Progress
            value={pct}
            variant={mode === "finished" && finished?.reason === "error" ? "danger" : "default"}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
