import { create } from "zustand";

import { DEFAULT_TICK_MS } from "@/constants/simulation";
import { chunkIntoBatches, generateJobs } from "@/services/jobFactory";
import { evaluateOperation, formatResult } from "@/services/operationService";
import type { FinishedJob, SimJob } from "@/types/simulation";

export type SimulationPhase = "setup" | "running" | "completed";

type CpuMap = Record<number, number>;

type SimulationStore = {
  phase: SimulationPhase;
  jobCount: number;
  paused: boolean;
  globalClock: number;
  tickMs: number;
  batches: SimJob[][];
  jobsById: Record<number, SimJob>;
  currentBatchIndex: number;
  readyQueue: number[];
  runningId: number | null;
  cpuElapsed: CpuMap;
  finished: FinishedJob[];

  setJobCount: (value: number) => void;
  setTickMs: (value: number) => void;
  start: () => void;
  reset: () => void;
  tick: () => void;
  pause: () => void;
  resume: () => void;
  ioInterrupt: () => void;
  errorTerminate: () => void;
};

function emptyState(): Pick<
  SimulationStore,
  | "phase"
  | "jobCount"
  | "paused"
  | "globalClock"
  | "tickMs"
  | "batches"
  | "jobsById"
  | "currentBatchIndex"
  | "readyQueue"
  | "runningId"
  | "cpuElapsed"
  | "finished"
> {
  return {
    phase: "setup",
    jobCount: 8,
    paused: false,
    globalClock: 0,
    tickMs: DEFAULT_TICK_MS,
    batches: [],
    jobsById: {},
    currentBatchIndex: 0,
    readyQueue: [],
    runningId: null,
    cpuElapsed: {},
    finished: [],
  };
}

function initBatch(
  batchIndex: number,
  batches: SimJob[][],
): { runningId: number | null; readyQueue: number[] } {
  const batch = batches[batchIndex];
  if (!batch?.length) {
    return { runningId: null, readyQueue: [] };
  }
  const ids = batch.map((j) => j.id).sort((a, b) => a - b);
  return { runningId: ids[0] ?? null, readyQueue: ids.slice(1) };
}

function isBatchFullyFinished(batch: SimJob[], finished: FinishedJob[]): boolean {
  const done = new Set(finished.map((f) => f.job.id));
  return batch.every((j) => done.has(j.id));
}

function buildJobsById(jobs: SimJob[]): Record<number, SimJob> {
  return Object.fromEntries(jobs.map((j) => [j.id, j]));
}

function pickNextCpuState(
  state: SimulationStore,
  finished: FinishedJob[],
): Pick<
  SimulationStore,
  "runningId" | "readyQueue" | "currentBatchIndex" | "phase" | "paused"
> {
  const runningId = state.readyQueue[0] ?? null;
  const readyQueue = state.readyQueue.slice(1);
  const currentBatchIndex = state.currentBatchIndex;

  if (runningId !== null) {
    return {
      runningId,
      readyQueue,
      currentBatchIndex,
      phase: state.phase,
      paused: state.paused,
    };
  }

  const batch = state.batches[currentBatchIndex];
  if (!batch || !isBatchFullyFinished(batch, finished)) {
    return {
      runningId: null,
      readyQueue,
      currentBatchIndex,
      phase: state.phase,
      paused: state.paused,
    };
  }

  const nextIndex = currentBatchIndex + 1;
  if (nextIndex >= state.batches.length) {
    return {
      runningId: null,
      readyQueue: [],
      currentBatchIndex: state.batches.length,
      phase: "completed",
      paused: true,
    };
  }

  const init = initBatch(nextIndex, state.batches);
  return {
    runningId: init.runningId,
    readyQueue: init.readyQueue,
    currentBatchIndex: nextIndex,
    phase: "running",
    paused: state.paused,
  };
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  ...emptyState(),

  setJobCount: (value) => {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n)) return;
    set({ jobCount: Math.max(1, Math.min(200, n)) });
  },

  setTickMs: (value) => {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n)) return;
    set({ tickMs: Math.max(200, Math.min(3000, n)) });
  },

  reset: () => set(emptyState()),

  start: () => {
    const { jobCount } = get();
    const jobs = generateJobs(jobCount);
    const batches = chunkIntoBatches(jobs);
    const { runningId, readyQueue } = initBatch(0, batches);
    set({
      phase: "running",
      paused: false,
      globalClock: 0,
      batches,
      jobsById: buildJobsById(jobs),
      currentBatchIndex: 0,
      runningId,
      readyQueue,
      cpuElapsed: {},
      finished: [],
    });
  },

  tick: () => {
    const state = get();
    if (state.phase !== "running" || state.paused) return;
    if (state.runningId === null) return;

    const job = state.jobsById[state.runningId];
    if (!job) return;

    const prev = state.cpuElapsed[state.runningId] ?? 0;
    const nextElapsed = prev + 1;

    if (nextElapsed < job.tme) {
      set({
        globalClock: state.globalClock + 1,
        cpuElapsed: { ...state.cpuElapsed, [state.runningId!]: nextElapsed },
      });
      return;
    }

    const value = evaluateOperation(job);
    const entry: FinishedJob = {
      job,
      reason: "normal",
      resultText: formatResult(value),
    };

    const finished = [...state.finished, entry];
    const cpuElapsed = { ...state.cpuElapsed, [state.runningId]: job.tme };
    const cpu = pickNextCpuState({ ...state, cpuElapsed, finished }, finished);

    set({
      globalClock: state.globalClock + 1,
      cpuElapsed,
      finished,
      runningId: cpu.runningId,
      readyQueue: cpu.readyQueue,
      currentBatchIndex: cpu.currentBatchIndex,
      phase: cpu.phase,
      paused: cpu.paused,
    });
  },

  pause: () => set({ paused: true }),

  resume: () => {
    const { phase } = get();
    if (phase === "completed") return;
    set({ paused: false });
  },

  ioInterrupt: () => {
    const state = get();
    if (state.phase !== "running" || state.paused || state.runningId === null) {
      return;
    }
    const id = state.runningId;
    const readyQueue = [...state.readyQueue, id];
    const runningId = readyQueue[0] ?? null;
    const rest = readyQueue.slice(1);
    set({ runningId, readyQueue: rest });
  },

  errorTerminate: () => {
    const state = get();
    if (state.phase !== "running" || state.paused || state.runningId === null) {
      return;
    }
    const job = state.jobsById[state.runningId];
    if (!job) return;

    const entry: FinishedJob = { job, reason: "error" };
    const finished = [...state.finished, entry];
    const cpu = pickNextCpuState({ ...state, finished }, finished);

    set({
      finished,
      runningId: cpu.runningId,
      readyQueue: cpu.readyQueue,
      currentBatchIndex: cpu.currentBatchIndex,
      phase: cpu.phase,
      paused: cpu.paused,
    });
  },
}));
