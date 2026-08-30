"use client";

import { useEffect, useRef } from "react";
import { Header } from "./chrome";
import { KeyAction } from "@/lib/enums/keyAction";
import type {
  ScreenRenderProps,
  ScreenType,
  Step,
} from "@/lib/interfaces/flow";

export interface ChatMessage {
  text: string;
}

export interface ChatStep extends Step {
  type: "chat";
  from?: string;
  messages: ChatMessage[];
  okLabel?: string;
  pauseMs?: number;
  typingMs?: number;
  typingLabel?: string;
  autoAdvanceMs?: number;
}

export interface ChatValue {
  visible: number;
  typing: boolean;
}

function ChatView({
  step,
  value,
  ctx,
}: ScreenRenderProps<ChatStep, ChatValue>) {
  const messages = step.messages;
  const done = value.visible >= messages.length;
  const scroller = useRef<HTMLDivElement>(null);

  const { setValue, sound, next } = ctx;
  const pause = step.pauseMs ?? 1000;
  const typing = step.typingMs ?? 1000;
  const autoAdvance = step.autoAdvanceMs;

  useEffect(() => {
    if (value.visible >= messages.length) return;

    if (value.visible === 0) {
      setValue((v) => ({ ...v, visible: 1 }));
      return;
    }

    const timers = [
      setTimeout(() => setValue((v) => ({ ...v, typing: true })), pause),
      setTimeout(
        () => setValue((v) => ({ ...v, typing: false })),
        pause + typing,
      ),
      setTimeout(
        () => {
          setValue((v) => ({ ...v, visible: v.visible + 1, typing: false }));
          sound.messageReceived();
        },
        pause + typing + 300,
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, [value.visible, messages.length, pause, typing, setValue, sound]);

  useEffect(() => {
    if (!done || autoAdvance === undefined) return;
    const timer = setTimeout(next, autoAdvance);
    return () => clearTimeout(timer);
  }, [done, autoAdvance, next]);

  useEffect(() => {
    const element = scroller.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [value.visible, value.typing]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {step.from !== undefined && (
        <Header
          left={<span className="font-bold">{step.from}</span>}
          right="[MSG]"
        />
      )}

      <div
        ref={scroller}
        className="flex min-h-0 flex-1 flex-col gap-[2cqw] overflow-y-auto p-[1.5cqw] pb-[6cqw] scrollbar-none"
      >
        {messages.slice(0, value.visible).map((message, index) => (
          <div
            key={index}
            className="max-w-[85%] self-start rounded-tr-xl rounded-b-xl border-2 border-lcd-dark bg-lcd-light p-[1.5cqw] text-[3.2cqw] leading-tight wrap-break-word"
          >
            {message.text}
          </div>
        ))}

        {value.typing && (
          <div className="max-w-[85%] self-start rounded-tr-xl rounded-b-xl border-2 border-lcd-dark bg-lcd-light p-[1.5cqw] text-[3.2cqw] leading-tight">
            {step.typingLabel ?? "typing..."}
          </div>
        )}
      </div>

      {done && step.okLabel !== undefined && (
        <div className="absolute inset-x-0 bottom-0 border-t border-lcd-dark bg-lcd-bg p-[1.5cqw] text-center text-[3.2cqw]">
          {step.okLabel}
        </div>
      )}
    </div>
  );
}

/** Messages arriving one by one. OK skips ahead, then moves on. */
export const chatScreen: ScreenType<ChatStep, ChatValue> = {
  initialValue: () => ({ visible: 0, typing: false }),
  keyClick: (action, ctx, step) =>
    !(action === KeyAction.Center && ctx.value.visible < step.messages.length),
  handleKey(action, ctx, step) {
    if (action === KeyAction.Clear) return ctx.back();
    if (action !== KeyAction.Center) return;

    if (ctx.value.visible < step.messages.length) {
      return ctx.setValue({ visible: step.messages.length, typing: false });
    }
    ctx.sound.screenTransition();
    ctx.next();
  },
  render: (props) => <ChatView {...props} />,
};
