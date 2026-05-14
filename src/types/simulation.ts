export type OperationKind =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "modulo"
  | "power";

export type SimJob = {
  id: number;
  tme: number;
  kind: OperationKind;
  left: number;
  right: number;
};

export type FinishReason = "normal" | "error";

export type FinishedJob = {
  job: SimJob;
  reason: FinishReason;
  resultText?: string;
};
