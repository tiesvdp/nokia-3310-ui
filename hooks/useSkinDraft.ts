"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyAction } from "@/lib/enums/keyAction";
import { isFormField } from "@/lib/helpers/dom";
import { fromPercent, round, toPercent } from "@/lib/helpers/percent";
import type { ButtonZone, Skin } from "@/lib/interfaces/skin";
import type { Rect } from "@/lib/interfaces/rect";
import type { SkinDraft } from "@/lib/interfaces/skinDraft";
import {
  SCREEN_SELECTION,
  type StudioSelection,
} from "@/lib/interfaces/studio";

const NUDGE = 0.1;
const NUDGE_FAST = 1;

const NUDGE_BY_KEY: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

/** Builds the skin the draft describes, for previewing and for exporting. */
export function draftToSkin(draft: SkinDraft, image: string): Skin {
  return {
    name: draft.name,
    image,
    aspectRatio: round(draft.aspectRatio, 4),
    screen: draft.screen,
    ...(draft.screenClip ? { screenClip: draft.screenClip } : null),
    palette: draft.palette,
    scanlines: draft.scanlines,
    zones: draft.zones,
  };
}

function moved(rect: Rect, dx: number, dy: number): Rect {
  return {
    ...rect,
    left: toPercent(fromPercent(rect.left) + dx),
    top: toPercent(fromPercent(rect.top) + dy),
  };
}

/**
 * A hook that manages a skin draft and the currently selected rectangle (screen or key zone).
 * @param initial The initial skin draft to manage.
 */
export function useSkinDraft(initial: SkinDraft) {
  const [draft, setDraft] = useState(initial);
  const [selected, setSelected] = useState<StudioSelection>(KeyAction.Center);

  const selectedZone =
    selected === SCREEN_SELECTION
      ? undefined
      : draft.zones.find((zone) => zone.key === selected);

  const updateZone = useCallback(
    (key: KeyAction, patch: Partial<ButtonZone>) => {
      setDraft((prev) => ({
        ...prev,
        zones: prev.zones.map((zone) =>
          zone.key === key ? { ...zone, ...patch } : zone,
        ),
      }));
    },
    [],
  );

  const updateScreen = useCallback((patch: Partial<Rect>) => {
    setDraft((prev) => ({ ...prev, screen: { ...prev.screen, ...patch } }));
  }, []);

  /** Moves whichever rectangle is selected. */
  const nudge = useCallback(
    (dx: number, dy: number) => {
      setDraft((prev) => {
        if (selected === SCREEN_SELECTION) {
          return { ...prev, screen: moved(prev.screen, dx, dy) };
        }
        return {
          ...prev,
          zones: prev.zones.map((zone) =>
            zone.key === selected ? { ...zone, ...moved(zone, dx, dy) } : zone,
          ),
        };
      });
    },
    [selected],
  );

  const setScreenClip = useCallback((screenClip: string) => {
    setDraft((prev) => ({ ...prev, screenClip }));
  }, []);

  const setPaletteColour = useCallback(
    (key: keyof SkinDraft["palette"], value: string) => {
      setDraft((prev) => ({
        ...prev,
        palette: { ...prev.palette, [key]: value },
      }));
    },
    [],
  );

  const setAspectRatio = useCallback((aspectRatio: number) => {
    setDraft((prev) => ({ ...prev, aspectRatio }));
  }, []);

  const reset = useCallback(() => setDraft(initial), [initial]);

  return {
    draft,
    selected,
    selectedZone,
    setSelected,
    updateZone,
    updateScreen,
    nudge,
    setScreenClip,
    setPaletteColour,
    setAspectRatio,
    reset,
  };
}

/**
 * A hook that listens for arrow key presses and calls the provided nudge function.
 * @param enabled Whether the nudge keys should be active. If false, the hook does nothing.
 * @param nudge A function that is called with the x and y deltas when an arrow key is pressed.
 */
export function useNudgeKeys(
  enabled: boolean,
  nudge: (dx: number, dy: number) => void,
) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      const direction = NUDGE_BY_KEY[event.key];
      if (!direction) return;
      if (isFormField(event.target)) return;
      event.preventDefault();
      const step = event.shiftKey ? NUDGE_FAST : NUDGE;
      nudge(direction[0] * step, direction[1] * step);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, nudge]);
}
