"use client";

import { Caret, Header, Navi, ScrollHint } from "./chrome";
import { KeyAction } from "@/lib/enums/keyAction";
import type {
  ScreenRenderProps,
  ScreenType,
  Step,
} from "@/lib/interfaces/flow";
import type { NaviLabels } from "@/lib/interfaces/naviLabels";
import type { Option } from "@/lib/interfaces/option";

export interface MultiSelectStep extends Step {
  type: "multiSelect";
  label?: string;
  prompt?: string;
  hint?: string;
  options: Option[];
  min?: number;
  max?: number;
  doneLabel?: string;
  minMessage?: string;
  maxMessage?: string;
  visibleCount?: number;
  navi?: NaviLabels;
}

export interface MultiSelectValue {
  selected: string[];
  cursor: number;
}

function MultiSelectView({
  step,
  value,
}: ScreenRenderProps<MultiSelectStep, MultiSelectValue>) {
  const visibleCount = step.visibleCount ?? 4;
  const doneIndex = step.options.length;
  const total = doneIndex + 1;
  const start = Math.max(0, Math.min(value.cursor - 1, total - visibleCount));
  const end = start + visibleCount;

  const rows = step.options
    .map((option, index) => ({ option, index }))
    .concat([
      {
        option: { label: step.doneLabel ?? "DONE", value: "" },
        index: doneIndex,
      },
    ])
    .slice(start, end);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {step.label !== undefined && (
        <Header left={step.label} right={`${value.selected.length} OK`} />
      )}

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

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="flex flex-col gap-[0.5cqw]">
          {rows.map(({ option, index }) => {
            const active = index === value.cursor;

            if (index === doneIndex) {
              return (
                <div
                  key="done"
                  className={`mt-[1cqw] flex items-center justify-center border-2 border-lcd-dark px-[1cqw] text-[4.5cqw] leading-tight font-bold ${
                    active ? "bg-lcd-dark text-lcd-bg" : ""
                  }`}
                >
                  {option.label}
                </div>
              );
            }

            return (
              <div
                key={option.value}
                className={`flex items-center gap-[1cqw] px-[1cqw] text-[3.8cqw] leading-tight ${
                  active ? "bg-lcd-dark text-lcd-bg" : ""
                }`}
              >
                <Caret active={active} />
                <span>
                  {value.selected.includes(option.value) ? "[x]" : "[ ]"}
                </span>
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>

        <ScrollHint up={start > 0} down={end < total} />
      </div>

      <Navi
        left={step.navi?.left ?? "Back"}
        center={
          step.navi?.center ??
          (value.cursor === doneIndex
            ? "OK"
            : value.selected.includes(step.options[value.cursor]?.value ?? "")
              ? "Clear"
              : "Pick")
        }
        right={step.navi?.right ?? "Navi"}
      />
    </div>
  );
}

/** Several choices from a list, with a done row after the last option */
export const multiSelectScreen: ScreenType<MultiSelectStep, MultiSelectValue> =
  {
    initialValue: () => ({ selected: [], cursor: 0 }),
    toAnswer: (value) => value.selected,
    handleKey(action, ctx, step) {
      const { selected, cursor } = ctx.value;
      const doneIndex = step.options.length;

      const finish = () => {
        const min = step.min ?? 0;
        if (selected.length < min) {
          return ctx.alert(step.minMessage ?? `Pick at least ${min}`);
        }
        ctx.sound.screenTransition();
        ctx.next();
      };

      if (action === KeyAction.Clear) return ctx.back();
      if (action === KeyAction.NavLeft) {
        return ctx.setValue({ selected, cursor: Math.max(0, cursor - 1) });
      }
      if (action === KeyAction.NavRight) {
        return ctx.setValue({
          selected,
          cursor: Math.min(doneIndex, cursor + 1),
        });
      }
      if (action === KeyAction.Hash) return finish();

      if (action === KeyAction.Center) {
        if (cursor === doneIndex) return finish();

        const option = step.options[cursor];
        if (!option) return;

        if (selected.includes(option.value)) {
          return ctx.setValue({
            cursor,
            selected: selected.filter((v) => v !== option.value),
          });
        }
        if (step.max !== undefined && selected.length >= step.max) {
          return ctx.alert(step.maxMessage ?? `Pick at most ${step.max}`);
        }
        ctx.setValue({ cursor, selected: [...selected, option.value] });
      }
    },
    render: (props) => <MultiSelectView {...props} />,
  };
