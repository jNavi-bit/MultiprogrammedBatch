import type { OperationKind, SimJob } from "@/types/simulation";

const SYMBOL: Record<OperationKind, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
  modulo: "%",
  power: "^",
};

export function formatOperation(job: SimJob): string {
  const sym = SYMBOL[job.kind];
  return `${job.left} ${sym} ${job.right}`;
}

export function evaluateOperation(job: SimJob): number {
  switch (job.kind) {
    case "add":
      return job.left + job.right;
    case "subtract":
      return job.left - job.right;
    case "multiply":
      return job.left * job.right;
    case "divide":
      return job.left / job.right;
    case "modulo":
      return job.left % job.right;
    case "power":
      return job.left ** job.right;
    default: {
      const _exhaustive: never = job.kind;
      return _exhaustive;
    }
  }
}

export function formatResult(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(4).replace(/\.?0+$/, "");
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
