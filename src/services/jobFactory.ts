import { BATCH_CAPACITY, TME_MAX, TME_MIN } from "@/constants/simulation";
import { randomInt } from "@/services/operationService";
import type { OperationKind, SimJob } from "@/types/simulation";

const KINDS: OperationKind[] = [
  "add",
  "subtract",
  "multiply",
  "divide",
  "modulo",
  "power",
];

function randomOperands(kind: OperationKind): { left: number; right: number } {
  const left = randomInt(2, 30);
  let right = randomInt(2, 18);

  if (kind === "divide" || kind === "modulo") {
    right = randomInt(2, 18);
    if (right === 0) right = 2;
  }

  if (kind === "power") {
    const base = randomInt(2, 9);
    const exp = randomInt(2, 5);
    return { left: base, right: exp };
  }

  if (kind === "subtract") {
    return { left: Math.max(left, right + 1), right };
  }

  return { left, right };
}

export function createRandomJob(id: number): SimJob {
  const kind = KINDS[randomInt(0, KINDS.length - 1)]!;
  const { left, right } = randomOperands(kind);
  const tme = randomInt(TME_MIN, TME_MAX);
  return { id, tme, kind, left, right };
}

export function generateJobs(count: number): SimJob[] {
  const jobs: SimJob[] = [];
  for (let id = 1; id <= count; id += 1) {
    jobs.push(createRandomJob(id));
  }
  return jobs.sort((a, b) => a.id - b.id);
}

export function chunkIntoBatches(jobs: SimJob[], size = BATCH_CAPACITY): SimJob[][] {
  const batches: SimJob[][] = [];
  for (let i = 0; i < jobs.length; i += size) {
    const slice = jobs.slice(i, i + size);
    batches.push(slice.sort((a, b) => a.id - b.id));
  }
  return batches;
}
