"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

import { cn } from "@/lib/utils";

type AnimatedIntegerProps = {
  value: number;
  className?: string;
  emphasis?: boolean;
};

export function AnimatedInteger({ value, className, emphasis }: AnimatedIntegerProps) {
  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: emphasis ? 10 : 6, opacity: 0, filter: emphasis ? "blur(4px)" : "blur(2px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: emphasis ? -10 : -6, opacity: 0, filter: emphasis ? "blur(4px)" : "blur(2px)" }}
          transition={{
            type: "spring",
            stiffness: emphasis ? 520 : 420,
            damping: emphasis ? 34 : 30,
            mass: 0.45,
          }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
