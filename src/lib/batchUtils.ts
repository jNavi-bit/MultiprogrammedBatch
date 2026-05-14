import type { SimJob } from "@/types/simulation";

export function batchIndexForJob(batches: SimJob[][], jobId: number): number {
  for (let i = 0; i < batches.length; i++) {
    if (batches[i].some((j) => j.id === jobId)) return i;
  }
  return -1;
}
