# Multiprogrammed Batch

A small **Next.js** web app that **simulates multiprogrammed batch processing**: jobs are grouped into **batches of up to four** processes, moved through a **ready queue**, executed one at a time on the **CPU**, and listed when **finished**. It is meant as a **visual teaching aid** for operating-systems concepts (batches, queues, time slices), not as a real scheduler.

## What you can do

- Start a run with a chosen number of jobs (data such as IDs, estimated time, and arithmetic operations are generated automatically).
- Watch **pending batches**, the **current batch queue**, the **running** process, and **completed** jobs update in real time.
- Control **pause**, **resume**, and **reset**, and tune **tick speed** (simulation step interval).
- Use keyboard shortcuts (**E**, **W**, **P**, **C**) for events such as I/O interrupt, error, pause, and continue (when focus is not in a text field).
- Switch **locale** (English, Spanish, German) and **theme** (light, dark, system).

## Tech stack

Next.js (App Router), React 19, TypeScript, **Zustand** for simulation state, **next-intl** for translations, Tailwind CSS v4, Radix UI primitives, and Framer Motion for light UI motion.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` (or the URL printed in the terminal). Production build: `pnpm build` then `pnpm start`.
