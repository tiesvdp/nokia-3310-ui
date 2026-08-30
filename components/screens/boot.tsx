"use client";

import { useEffect, useState } from "react";
import type {
  ScreenRenderProps,
  ScreenType,
  Step,
} from "@/lib/interfaces/flow";

export interface BootStep extends Step {
  type: "boot";
  brand?: string;
  model?: string;
  label?: string;
  durationMs?: number;
}

function BootView({ step, ctx }: ScreenRenderProps<BootStep, undefined>) {
  const total = step.durationMs ?? 2200;
  const [phase, setPhase] = useState(0);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), total * 0.18),
      setTimeout(() => setPhase(2), total * 0.41),
      setTimeout(() => setPhase(3), total * 0.73),
      setTimeout(() => ctx.next(), total),
    ];
    const ticker = setInterval(() => setDots((d) => (d + 1) % 4), 350);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(ticker);
    };
  }, [total, ctx]);

  const subtitle =
    phase === 0
      ? step.model
      : phase === 1
        ? `${step.label ?? "connecting"}${".".repeat(dots)}`
        : phase === 2
          ? `[${">".repeat(dots + 1)}${" ".repeat(3 - dots)}]`
          : "";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-center">
      <div className="text-[6cqw] font-bold tracking-widest">
        {step.brand ?? "NOKIA"}
      </div>
      <div className="mt-[0.5cqw] min-h-[4cqw] text-[3.5cqw] tracking-wider">
        {subtitle}
      </div>
    </div>
  );
}

/** Splash screen. Advances on its own. Any key skips it. */
export const bootScreen: ScreenType<BootStep, undefined> = {
  keyClick: () => false,
  handleKey(_action, ctx) {
    ctx.next();
  },
  render: (props) => <BootView {...props} />,
};
