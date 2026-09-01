"use client";

import type { Palette } from "@/lib/interfaces/skin";
import { FIELD_LABEL } from "./ui";

const KEYS = ["bg", "dark", "mid", "light"] as const;

interface Props {
  palette: Palette;
  onChange(key: keyof Palette, value: string): void;
}

export function PalettePicker({ palette, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {KEYS.map((key) => (
        <label key={key} className={FIELD_LABEL}>
          {key}
          <input
            type="color"
            className="h-7 w-full rounded border border-neutral-700 bg-neutral-950 p-px"
            value={palette[key]}
            onChange={(event) => onChange(key, event.target.value)}
          />
        </label>
      ))}
    </div>
  );
}
