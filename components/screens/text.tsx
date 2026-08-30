"use client";

import { useEffect, useState } from "react";
import {
  EMPTY_T9,
  t9Append,
  t9Backspace,
  t9Commit,
  t9Press,
  useT9CommitTimer,
} from "@/lib/t9";
import type { T9Buffer, T9Map, T9Options } from "@/lib/interfaces/t9";
import type { NaviLabels } from "@/lib/interfaces/naviLabels";
import { Header, Navi } from "./chrome";
import { DEFAULT_T9_MAP } from "@/config/t9Map";
import { DIGIT_BY_KEY, KeyAction } from "@/lib/enums/keyAction";
import type {
  ScreenRenderProps,
  ScreenType,
  Step,
} from "@/lib/interfaces/flow";

export interface TextStep extends Step {
  type: "text";
  label?: string;
  prompt?: string;
  hint?: string;
  maxLength?: number;
  required?: boolean;
  t9Map?: T9Map;
  autoCapitalise?: boolean;
  emptyMessage?: string;
  navi?: NaviLabels;
}

function optionsFor(step: TextStep): T9Options {
  return {
    map: step.t9Map ?? DEFAULT_T9_MAP,
    autoCapitalise: step.autoCapitalise,
    maxLength: step.maxLength,
  };
}

function TextView({ step, value, ctx }: ScreenRenderProps<TextStep, T9Buffer>) {
  const [caretOn, setCaretOn] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCaretOn((on) => !on), 500);
    return () => clearInterval(timer);
  }, []);

  useT9CommitTimer(value, ctx.setValue, optionsFor(step));

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {step.label !== undefined && <Header left={step.label} />}

      {step.prompt && (
        <div className="mt-[0.5cqw] flex-none text-[3.8cqw] leading-tight">
          {step.prompt}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="flex h-[15cqw] w-full items-center overflow-hidden border border-lcd-dark bg-lcd-light px-[2cqw] text-[5.5cqw] leading-none font-bold">
          <span className="break-all">{value.text}</span>
          {value.pending && <span className="underline">{value.pending}</span>}
          <span
            className={`ml-[0.5cqw] inline-block h-[5cqw] w-[3cqw] shrink-0 bg-lcd-dark ${
              caretOn ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
        {step.hint && (
          <div className="mt-[1cqw] text-[2.6cqw] leading-snug opacity-70">
            {step.hint}
          </div>
        )}
      </div>

      <Navi
        left={step.navi?.left ?? "Clear"}
        center={step.navi?.center ?? "OK"}
        right={step.navi?.right ?? "Navi"}
      />
    </div>
  );
}

/** Multi-tap text entry */
export const textScreen: ScreenType<TextStep, T9Buffer> = {
  initialValue: () => ({ ...EMPTY_T9 }),
  toAnswer: (value) => t9Commit(value).text,
  handleKey(action, ctx, step) {
    const options = optionsFor(step);
    const buffer = ctx.value;

    if (action === KeyAction.Clear || action === KeyAction.Star) {
      const { buffer: next, emptied } = t9Backspace(buffer);
      ctx.setValue(next);
      if (emptied && action === KeyAction.Clear) ctx.back();
      return;
    }

    if (action === KeyAction.Key0) {
      return ctx.setValue(t9Append(buffer, " ", options));
    }
    if (action === KeyAction.Hash) return ctx.setValue(t9Commit(buffer));

    if (action === KeyAction.Center) {
      const committed = t9Commit(buffer);
      ctx.setValue(committed);
      if (!committed.text.trim() && step.required !== false) {
        return ctx.alert(step.emptyMessage ?? "Type something first");
      }
      ctx.sound.screenTransition();
      return ctx.next();
    }

    const digit = DIGIT_BY_KEY[action];
    if (digit) ctx.setValue(t9Press(buffer, digit, options));
  },
  render: (props) => <TextView {...props} />,
};
