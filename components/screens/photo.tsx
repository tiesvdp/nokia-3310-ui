"use client";

import { useEffect, useState } from "react";
import { Header } from "./chrome";
import { KeyAction } from "@/lib/enums/keyAction";
import type {
  ScreenRenderProps,
  ScreenType,
  Step,
} from "@/lib/interfaces/flow";

export interface PhotoStep extends Step {
  type: "photo";
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  shutter?: boolean;
  okLabel?: string;
}

function PhotoView({ step, ctx }: ScreenRenderProps<PhotoStep, undefined>) {
  const withShutter = step.shutter ?? true;
  const [flash, setFlash] = useState(withShutter);
  const { sound } = ctx;

  useEffect(() => {
    if (!withShutter) return;
    sound.shutter();
    const timer = setTimeout(() => setFlash(false), 300);
    return () => clearTimeout(timer);
  }, [withShutter, sound]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {flash && (
        <div className="absolute inset-0 z-10 animate-pulse bg-white" />
      )}

      <Header left={step.title ?? "PHOTO"} right="[CAM]" />

      <div className="relative my-[0.5cqw] flex min-h-0 flex-1 flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={step.src}
          alt={step.alt ?? ""}
          className="min-h-0 w-full flex-1 object-cover"
        />
        {step.caption && (
          <div className="mt-[1cqw] flex-none bg-lcd-bg px-[1cqw] text-[3.2cqw] leading-tight font-bold">
            {step.caption}
          </div>
        )}
      </div>

      <div className="mt-auto flex-none border-t border-lcd-dark pt-[0.5cqw] text-center text-[3.2cqw] opacity-80">
        {step.okLabel ?? "OK to continue"}
      </div>
    </div>
  );
}

/** A photo filling the screen, with a shutter flash on arrival */
export const photoScreen: ScreenType<PhotoStep, undefined> = {
  handleKey(action, ctx) {
    if (action === KeyAction.Clear) return ctx.back();
    if (action === KeyAction.Center) {
      ctx.sound.screenTransition();
      ctx.next();
    }
  },
  render: (props) => <PhotoView {...props} />,
};
