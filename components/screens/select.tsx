"use client";

import { Caret, Navi } from "./chrome";
import { Header } from "./chrome";
import { KeyAction } from "@/lib/enums/keyAction";
import type {
  ScreenRenderProps,
  ScreenType,
  Step,
} from "@/lib/interfaces/flow";
import type { NaviLabels } from "@/lib/interfaces/naviLabels";
import type { Option } from "@/lib/interfaces/option";

export interface SelectStep extends Step {
  type: "select";
  label?: string;
  prompt?: string;
  hint?: string;
  options: Option[];
  defaultValue?: string;
  navi?: NaviLabels;
}

function SelectView({ step, value }: ScreenRenderProps<SelectStep, number>) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {step.label !== undefined && <Header left={step.label} />}

      {step.prompt && (
        <div className="mt-[0.5cqw] flex-none text-[3.6cqw] leading-tight">
          {step.prompt}
          {step.hint && (
            <div className="pt-[1.4cqw] text-[2.8cqw] opacity-80">
              {step.hint}
            </div>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-[0.5cqw]">
        {step.options.map((option, index) => (
          <div
            key={option.value}
            className={`flex items-center gap-[1cqw] px-[1cqw] text-[3.8cqw] leading-tight ${
              index === value ? "bg-lcd-dark text-lcd-bg" : ""
            }`}
          >
            <Caret active={index === value} />
            <span>{option.label}</span>
          </div>
        ))}
      </div>

      <Navi
        left={step.navi?.left ?? "Back"}
        center={step.navi?.center ?? "OK"}
        right={step.navi?.right ?? "Pick"}
      />
    </div>
  );
}

/** One choice from a list. The Navi key moves the cursor, OK confirms */
export const selectScreen: ScreenType<SelectStep, number> = {
  initialValue: (step) => {
    const index = step.options.findIndex((o) => o.value === step.defaultValue);
    return index === -1 ? 0 : index;
  },
  toAnswer: (value, step) => step.options[value]?.value ?? null,
  handleKey(action, ctx, step) {
    if (action === KeyAction.Clear) return ctx.back();
    if (action === KeyAction.NavLeft) {
      return ctx.setValue(Math.max(0, ctx.value - 1));
    }
    if (action === KeyAction.NavRight) {
      return ctx.setValue(Math.min(step.options.length - 1, ctx.value + 1));
    }
    if (action === KeyAction.Center) {
      ctx.sound.screenTransition();
      ctx.next();
    }
  },
  render: (props) => <SelectView {...props} />,
};
