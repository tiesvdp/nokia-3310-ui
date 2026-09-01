"use client";

import { clamp, fromPercent, toPercent } from "@/lib/helpers/percent";
import { Rect } from "@/lib/interfaces/rect";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";

interface Props {
  rect: Rect;
  label: string;
  color: string;
  selected: boolean;
  onSelect(): void;
  onChange(rect: Rect): void;
  boxOf(): DOMRect | null;
}

/**
 * A rectangle that can be moved and resized with the mouse or touch.
 * @param rect The rectangle to edit, in percentages of the parent box.
 * @param label The label to display inside the rectangle.
 * @param color The background color of the rectangle.
 * @param selected Whether the rectangle is currently selected.
 * @param onSelect Callback when the rectangle is selected.
 * @param onChange Callback when the rectangle is changed.
 * @param boxOf Function that returns the bounding box of the parent element, used to calculate percentages.
 */
export function EditableRect({
  rect,
  label,
  color,
  selected,
  onSelect,
  onChange,
  boxOf,
}: Props) {
  const drag = useRef<{
    mode: "move" | "resize";
    x: number;
    y: number;
    start: Rect;
  } | null>(null);

  function begin(
    mode: "move" | "resize",
    event: ReactPointerEvent<HTMLElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();
    onSelect();
    drag.current = {
      mode,
      x: event.clientX,
      y: event.clientY,
      start: { ...rect },
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  const move = (event: ReactPointerEvent<HTMLElement>) => {
    const state = drag.current;
    const box = boxOf();
    if (!state || !box) return;

    const dx = ((event.clientX - state.x) / box.width) * 100;
    const dy = ((event.clientY - state.y) / box.height) * 100;

    if (state.mode === "move") {
      onChange({
        ...rect,
        left: toPercent(
          clamp(
            fromPercent(state.start.left) + dx,
            0,
            100 - fromPercent(rect.width),
          ),
        ),
        top: toPercent(
          clamp(
            fromPercent(state.start.top) + dy,
            0,
            100 - fromPercent(rect.height),
          ),
        ),
      });
      return;
    }

    onChange({
      ...rect,
      width: toPercent(Math.max(1, fromPercent(state.start.width) + dx)),
      height: toPercent(Math.max(0.5, fromPercent(state.start.height) + dy)),
    });
  };

  const end = (event: ReactPointerEvent<HTMLElement>) => {
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      className={`absolute flex cursor-move touch-none items-center justify-center rounded-sm ${
        selected
          ? "z-5 border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
          : "z-4 border border-white/35"
      }`}
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        backgroundColor: color,
        ...(rect.rotate ? { transform: `rotate(${rect.rotate}deg)` } : null),
      }}
      onPointerDown={(event) => begin("move", event)}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <span className="pointer-events-none truncate text-[8px] font-bold text-black/75">
        {label}
      </span>
      {selected && (
        <span
          className="absolute -right-1.25 -bottom-1.25 h-2.5 w-2.5 cursor-nwse-resize rounded-sm border border-neutral-900 bg-white"
          onPointerDown={(event) => begin("resize", event)}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
      )}
    </div>
  );
}
