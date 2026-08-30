"use client";

import { useState } from "react";
import { Phone, type PhoneProps } from "./Phone";
import { createSound } from "@/lib/sound";
import { useFlow } from "@/hooks/useFlow";
import type { Sound, SoundOptions } from "@/lib/interfaces/sound";
import type { ScreenRegistry, Step } from "@/lib/interfaces/flow";

export interface PhoneFlowProps extends Omit<
  PhoneProps,
  "onKey" | "children" | "overlay"
> {
  flow: Step[];
  screens?: ScreenRegistry;
  onSubmit?(answers: Record<string, unknown>): void | Promise<void>;
  onComplete?(answers: Record<string, unknown>): void;
  sound?: Sound;
  soundOptions?: SoundOptions;
}

/**
 * Renders a phone UI with a given flow of steps. Handles user input and sound fx.
 * @param flow The array of steps that define the flow of the phone interaction.
 * @param screens Optional registry of screen components to render for each step.
 * @param onSubmit Callback function invoked when a step is submitted.
 * @param onComplete Callback function invoked when the flow is completed.
 * @param sound Optional sound object to play sound fx during the flow.
 * @param soundOptions Optional configuration for creating a default sound object if none is provided.
 * @param phoneProps Additional props to pass to the underlying Phone component.
 */
export function PhoneFlow({
  flow,
  screens,
  onSubmit,
  onComplete,
  sound,
  soundOptions,
  ...phoneProps
}: PhoneFlowProps) {
  const [ownAudio] = useState(() => createSound(soundOptions));
  const audio = sound ?? ownAudio;

  const { step, screen, state, ctx, handleKey } = useFlow({
    flow,
    screens,
    onSubmit,
    onComplete,
    sound: audio,
  });

  return (
    <Phone
      {...phoneProps}
      onKey={handleKey}
      overlay={
        state.alert && (
          <div
            role="alert"
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 p-[2cqw]"
          >
            <div className="border-2 border-lcd-dark bg-lcd-bg p-[2cqw] text-center text-[3.2cqw] leading-tight">
              {state.alert}
            </div>
          </div>
        )
      }
    >
      {(step.render ?? screen.render)({
        step,
        value: state.values[step.id],
        ctx,
      })}
    </Phone>
  );
}
