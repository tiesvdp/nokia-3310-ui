import type { ReactNode } from "react";

/* Title bar */
export function Header({
  left,
  right,
}: {
  left: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="relative z-1 flex flex-none items-center justify-between border-b border-lcd-dark bg-lcd-bg pb-[0.5cqw] text-[2.8cqw]">
      <span>{left}</span>
      {right !== undefined && <span>{right}</span>}
    </div>
  );
}

/* Selection marker */
export function Caret({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className="flex w-[4cqw] shrink-0 items-center justify-center"
    >
      {active && (
        <svg viewBox="0 0 6 8" fill="currentColor" className="w-[2.4cqw]">
          <path d="M0 0l6 4-6 4z" />
        </svg>
      )}
    </span>
  );
}

/* Scroll indicators */
export function ScrollHint({ up, down }: { up: boolean; down: boolean }) {
  return (
    <div
      aria-hidden
      className="mt-[1.5cqw] flex h-[3cqw] flex-none items-center justify-center gap-[2.5cqw]"
    >
      <svg
        viewBox="0 0 8 6"
        fill="currentColor"
        className={`h-full ${up ? "opacity-60" : "opacity-0"}`}
      >
        <path d="M4 0l4 6H0z" />
      </svg>
      <svg
        viewBox="0 0 8 6"
        fill="currentColor"
        className={`h-full ${down ? "opacity-60" : "opacity-0"}`}
      >
        <path d="M0 0h8L4 6z" />
      </svg>
    </div>
  );
}

/* Navigation keys */
export function Navi({
  left,
  center,
  right,
}: {
  left: string;
  center: string;
  right: string;
}) {
  return (
    <div className="mt-auto flex-none border-t border-lcd-dark pt-[0.5cqw]">
      <div className="relative flex items-end justify-between text-[3cqw] leading-none">
        <span>{left}</span>
        {center && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[3.5cqw] leading-none font-bold">
            {center}
          </span>
        )}
        <span className="opacity-50">{right}</span>
      </div>
      <div className="relative mt-[0.5cqw] flex items-end justify-between">
        <div className="h-[1.5cqw] w-[6cqw] bg-lcd-dark" />
        <div className="absolute bottom-0 left-1/2 h-[2cqw] w-[12cqw] -translate-x-1/2 rounded-t-full border-2 border-b-0 border-lcd-dark" />
        <div className="h-[1.5cqw] w-[6cqw] bg-lcd-dark opacity-50" />
      </div>
    </div>
  );
}
