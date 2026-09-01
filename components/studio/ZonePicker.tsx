"use client";

import type { ButtonZone } from "@/lib/interfaces/skin";
import {
  SCREEN_SELECTION,
  type StudioSelection,
} from "@/lib/interfaces/studio";
import { toggle } from "./ui";

interface Props {
  zones: ButtonZone[];
  selected: StudioSelection;
  onSelect(selection: StudioSelection): void;
}

export function ZonePicker({ zones, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      <button
        type="button"
        className={toggle(selected === SCREEN_SELECTION)}
        onClick={() => onSelect(SCREEN_SELECTION)}
      >
        screen
      </button>
      {zones.map((zone) => (
        <button
          key={zone.key}
          type="button"
          className={toggle(selected === zone.key)}
          onClick={() => onSelect(zone.key)}
        >
          {zone.label}
        </button>
      ))}
    </div>
  );
}
