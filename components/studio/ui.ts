export const SECTION_TITLE =
  "mb-2 text-[0.7rem] font-semibold tracking-[0.09em] text-neutral-400 uppercase";

export const FIELD =
  "w-full rounded border border-neutral-700 bg-neutral-950 px-1.5 py-1 text-xs text-neutral-100";

export const FIELD_LABEL = "flex flex-col gap-0.5 text-[0.68rem] text-neutral-400";

export const BUTTON =
  "cursor-pointer rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-400 hover:text-neutral-100";

export const BUTTON_ON =
  "cursor-pointer rounded border border-lime-400 bg-lime-400 px-2 py-1 text-xs font-semibold text-neutral-900";

export const toggle = (on: boolean) => (on ? BUTTON_ON : BUTTON);
