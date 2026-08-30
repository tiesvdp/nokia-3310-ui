"use client";

import { useEffect, useState } from "react";
import { Header } from "./chrome";
import { SubmitStatus } from "@/lib/enums/submitStatus";
import type { ReactNode } from "react";
import type {
  ScreenRenderProps,
  ScreenType,
  Step,
} from "@/lib/interfaces/flow";

export interface ConfirmStep extends Step {
  type: "confirm";
  label?: string;
  title?: string;
  message?: string;
  sendingLabel?: string;
  errorTitle?: string;
  errorMessage?: string;
  renderDone?(answers: Record<string, unknown>): ReactNode;
}

/* Display a "sending" message with a dot animation */
function Sending({ label }: { label: string }) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setDots((d) => (d + 1) % 4), 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="text-[4.5cqw]">
        {label}
        {".".repeat(dots)}
      </div>
      <div className="mt-[0.5cqw] text-[8cqw]">[SIG]</div>
    </>
  );
}

/* Display a failure message */
function Failed({ title, message }: { title: string; message: string }) {
  return (
    <>
      <div className="text-[4.5cqw] font-bold">{title}</div>
      <div className="mt-[0.5cqw] text-[3.5cqw] leading-snug">{message}</div>
    </>
  );
}

/* Display a success message */
function Done({
  step,
  answers,
}: {
  step: ConfirmStep;
  answers: Record<string, unknown>;
}) {
  if (step.renderDone) return <>{step.renderDone(answers)}</>;

  return (
    <>
      <div className="text-[7cqw]">[!!!]</div>
      <div className="text-[5.5cqw] font-bold uppercase">
        {step.title ?? "THANKS"}
      </div>
      {step.message && (
        <div className="text-[3.5cqw] leading-snug opacity-80">
          {step.message}
        </div>
      )}
    </>
  );
}

/* Main view for the confirm screen */
function ConfirmView({ step, ctx }: ScreenRenderProps<ConfirmStep, undefined>) {
  const { status, error } = ctx.submitState;
  const settled =
    status === SubmitStatus.Done || status === SubmitStatus.Idle;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {settled && step.label !== undefined && (
        <Header left={step.label} right="[OK]" />
      )}

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        {status === SubmitStatus.Pending && (
          <Sending label={step.sendingLabel ?? "Sending"} />
        )}
        {status === SubmitStatus.Error && (
          <Failed
            title={step.errorTitle ?? "FAILED"}
            message={step.errorMessage ?? error ?? "Something went wrong"}
          />
        )}
        {settled && <Done step={step} answers={ctx.answers} />}
      </div>
    </div>
  );
}

/** End of the flow */
export const confirmScreen: ScreenType<ConfirmStep, undefined> = {
  keyClick: () => false,
  render: (props) => <ConfirmView {...props} />,
};
