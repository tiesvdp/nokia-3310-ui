"use client";

import { useEffect, useState } from "react";
import { Header } from "./chrome";
import { EnvelopeIcon } from "@/components/icons/EnvelopeIcon";
import { KeyAction } from "@/lib/enums/keyAction";
import type { ReactNode } from "react";
import type {
  ScreenRenderProps,
  ScreenType,
  Step,
} from "@/lib/interfaces/flow";

export interface NoticeStep extends Step {
  type: "notice";
  label?: string;
  title?: string;
  lines?: string[];
  hint?: string;
  icon?: "envelope" | ReactNode;
  chime?: boolean;
}

function NoticeView({ step, ctx }: ScreenRenderProps<NoticeStep, undefined>) {
  const [blink, setBlink] = useState(true);
  const { sound } = ctx;
  const chime = step.chime ?? false;

  useEffect(() => {
    const timer = setInterval(() => setBlink((on) => !on), 600);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (chime) sound.messageReceived();
  }, [chime, sound]);

  const icon = step.icon === "envelope" ? <EnvelopeIcon /> : step.icon;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {step.label !== undefined && <Header left={step.label} right="[MSG]" />}

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        {icon && <div className="mb-[3cqw]">{icon}</div>}
        {step.title && (
          <div className="mb-[1.5cqw] text-[4.5cqw] font-bold">
            {step.title}
          </div>
        )}
        {step.lines?.map((line, index) => (
          <div key={index} className="text-[3.5cqw] leading-snug">
            {line}
          </div>
        ))}
      </div>

      {step.hint && (
        <div
          className={`flex-none pb-[1cqw] text-center text-[3cqw] ${
            blink ? "opacity-100" : "opacity-0"
          }`}
        >
          {step.hint}
        </div>
      )}
    </div>
  );
}

/** A message or announcement that waits for a key press */
export const noticeScreen: ScreenType<NoticeStep, undefined> = {
  keyClick: (action) => action !== KeyAction.Center,
  handleKey(action, ctx) {
    if (action === KeyAction.Clear) return ctx.back();
    if (action === KeyAction.Center) ctx.next();
  },
  render: (props) => <NoticeView {...props} />,
};
