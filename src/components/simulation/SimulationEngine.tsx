"use client";

import { useEffect } from "react";

import { useSimulationStore } from "@/store/simulationStore";

const CODE_TO_SIM: Partial<Record<string, "e" | "w" | "p" | "c">> = {
  KeyE: "e",
  KeyW: "w",
  KeyP: "p",
  KeyC: "c",
};

function shouldIgnoreShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) {
    const t = target.type;
    return t !== "number" && t !== "range";
  }
  return false;
}

function resolveSimKey(event: KeyboardEvent): "e" | "w" | "p" | "c" | null {
  const fromCode = CODE_TO_SIM[event.code];
  if (fromCode) return fromCode;
  if (event.key.length === 1) {
    const k = event.key.toLowerCase();
    if (k === "e" || k === "w" || k === "p" || k === "c") return k;
  }
  return null;
}

export function SimulationEngine() {
  const tickMs = useSimulationStore((s) => s.tickMs);
  const phase = useSimulationStore((s) => s.phase);
  const paused = useSimulationStore((s) => s.paused);

  useEffect(() => {
    if (phase !== "running" || paused) return;
    const id = window.setInterval(() => {
      useSimulationStore.getState().tick();
    }, tickMs);
    return () => window.clearInterval(id);
  }, [phase, paused, tickMs]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const simKey = resolveSimKey(event);
      if (!simKey) return;
      if (shouldIgnoreShortcutTarget(event.target)) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const store = useSimulationStore.getState();
      if (simKey === "e") {
        store.ioInterrupt();
      } else if (simKey === "w") {
        store.errorTerminate();
      } else if (simKey === "p") {
        store.pause();
      } else {
        store.resume();
      }
    };

    document.addEventListener("keydown", handler, { capture: true });
    return () => document.removeEventListener("keydown", handler, { capture: true });
  }, []);

  return null;
}
