"use client";

import { CheckCircle2, ClipboardList, Cpu, Layers } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProcessInfoCard } from "@/components/simulation/ProcessInfoCard";
import { batchIndexForJob } from "@/lib/batchUtils";
import { useSimulationStore } from "@/store/simulationStore";

export function SimulationColumns() {
  const tc = useTranslations("columns");
  const te = useTranslations("empty");

  const phase = useSimulationStore((s) => s.phase);
  const batches = useSimulationStore((s) => s.batches);
  const currentBatchIndex = useSimulationStore((s) => s.currentBatchIndex);
  const readyQueue = useSimulationStore((s) => s.readyQueue);
  const runningId = useSimulationStore((s) => s.runningId);
  const jobsById = useSimulationStore((s) => s.jobsById);
  const cpuElapsed = useSimulationStore((s) => s.cpuElapsed);
  const finished = useSimulationStore((s) => s.finished);

  const runningJob = runningId ? jobsById[runningId] : undefined;
  const runningBatchIndex =
    runningJob && batches.length ? batchIndexForJob(batches, runningJob.id) : currentBatchIndex;

  const columnShell =
    "flex min-h-[360px] flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-2 shadow-sm backdrop-blur-sm dark:bg-card/30 sm:p-3 lg:min-h-[min(68vh,640px)] lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto";

  if (phase === "setup" && !batches.length) {
    return (
      <div className="grid gap-3 lg:grid-cols-3">
        <div className={`${columnShell} items-center justify-center text-center`}>
          <Layers className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{te("beforeStart")}</p>
        </div>
        <div className={`${columnShell} items-center justify-center text-center`}>
          <Cpu className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{te("cpuIdle")}</p>
        </div>
        <div className={`${columnShell} items-center justify-center text-center`}>
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{te("noFinished")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <section className={columnShell}>
        <div className="flex items-center gap-1.5 border-b border-border/50 pb-1.5">
          <Layers className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-xs font-semibold tracking-tight text-foreground">{tc("batchesAndQueue")}</h2>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">{te("noBatches")}</p>
          ) : (
            batches.map((batch, bi) => {
              if (bi < currentBatchIndex) {
                return (
                  <div
                    key={bi}
                    className="flex items-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500/90" aria-hidden />
                    <span>
                      {tc("batchDone", { n: bi + 1 })}
                    </span>
                  </div>
                );
              }

              if (bi > currentBatchIndex) {
                return (
                  <div key={bi} className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {tc("batchPending", { n: bi + 1 })}
                    </p>
                    {batch.map((job) => (
                      <ProcessInfoCard
                        key={job.id}
                        job={job}
                        batchIndex={bi}
                        mode="pending-batch"
                        elapsed={cpuElapsed[job.id] ?? 0}
                      />
                    ))}
                  </div>
                );
              }

              return (
                <div key={bi} className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {tc("batchActive", { n: bi + 1 })}
                  </p>
                  {readyQueue.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {runningId ? tc("queueCpuOnly") : tc("queueEmpty")}
                    </p>
                  ) : (
                    readyQueue.map((id) => {
                      const job = jobsById[id];
                      if (!job) return null;
                      return (
                        <ProcessInfoCard
                          key={id}
                          job={job}
                          batchIndex={bi}
                          mode="queued"
                          elapsed={cpuElapsed[id] ?? 0}
                        />
                      );
                    })
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className={columnShell}>
        <div className="flex items-center gap-1.5 border-b border-border/50 pb-1.5">
          <Cpu className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-xs font-semibold tracking-tight">{tc("running")}</h2>
        </div>
        {runningJob && runningBatchIndex >= 0 ? (
          <ProcessInfoCard
            job={runningJob}
            batchIndex={runningBatchIndex}
            mode="running"
            elapsed={cpuElapsed[runningJob.id] ?? 0}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/10 p-4 text-center">
            <Cpu className="h-7 w-7 text-muted-foreground/35" aria-hidden />
            <p className="mt-1.5 text-xs text-muted-foreground">{te("cpuIdle")}</p>
          </div>
        )}
      </section>

      <section className={columnShell}>
        <div className="flex items-center gap-1.5 border-b border-border/50 pb-1.5">
          <ClipboardList className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-xs font-semibold tracking-tight">{tc("finished")}</h2>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {finished.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/10 p-4 text-center">
              <ClipboardList className="h-7 w-7 text-muted-foreground/35" aria-hidden />
              <p className="mt-1.5 text-xs text-muted-foreground">{te("noFinished")}</p>
            </div>
          ) : (
            finished.map((entry, index) => {
              const bi = batchIndexForJob(batches, entry.job.id);
              const batchIndex = bi >= 0 ? bi : 0;
              const elapsed =
                entry.reason === "normal"
                  ? entry.job.tme
                  : (cpuElapsed[entry.job.id] ?? 0);
              return (
                <ProcessInfoCard
                  key={`${entry.job.id}-${index}`}
                  job={entry.job}
                  batchIndex={batchIndex}
                  mode="finished"
                  elapsed={elapsed}
                  finished={entry}
                />
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
