"use client";

import { fromPercent, toPercent } from "@/lib/helpers/percent";
import type { Rect } from "@/lib/interfaces/rect";
import { FIELD, FIELD_LABEL } from "./ui";

const SIDES = ["top", "left", "width", "height"] as const;

interface Props {
  rect: Rect;
  onChange(patch: Partial<Rect>): void;
  /** Rotation only makes sense for key zones, not for the screen. */
  withRotation?: boolean;
}

export function RectFields({ rect, onChange, withRotation }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SIDES.map((side) => (
        <label key={side} className={FIELD_LABEL}>
          {side}
          <input
            type="number"
            step="0.1"
            className={FIELD}
            value={fromPercent(rect[side])}
            onChange={(event) =>
              onChange({ [side]: toPercent(Number(event.target.value)) })
            }
          />
        </label>
      ))}

      {withRotation && (
        <label className={FIELD_LABEL}>
          rotate
          <input
            type="number"
            step="1"
            className={FIELD}
            value={rect.rotate ?? 0}
            onChange={(event) =>
              onChange({ rotate: Number(event.target.value) || undefined })
            }
          />
        </label>
      )}
    </div>
  );
}
