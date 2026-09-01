"use client";

import { useCallback, useRef } from "react";
import { EditableRect } from "@/components/EditableRect";
import { Phone } from "@/components/Phone";
import type { KeyAction } from "@/lib/enums/keyAction";
import type { Rect } from "@/lib/interfaces/rect";
import type { ButtonZone, Skin } from "@/lib/interfaces/skin";
import {
  SCREEN_SELECTION,
  type StudioSelection,
} from "@/lib/interfaces/studio";

interface Props {
  skin: Skin;
  zones: ButtonZone[];
  screen: Rect;
  selected: StudioSelection;
  testing: boolean;
  lastKey: KeyAction | null;
  onSelect(selection: StudioSelection): void;
  onScreenChange(rect: Rect): void;
  onZoneChange(key: KeyAction, rect: Rect): void;
  onKey(action: KeyAction): void;
}

export function StudioStage({
  skin,
  zones,
  screen,
  selected,
  testing,
  lastKey,
  onSelect,
  onScreenChange,
  onZoneChange,
  onKey,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);

  const boxOf = useCallback(
    () =>
      wrap.current?.querySelector(".phone-frame")?.getBoundingClientRect() ??
      null,
    [],
  );

  return (
    <div className="relative min-h-[60dvh] touch-none p-6" ref={wrap}>
      <Phone
        skin={skin}
        debug={false}
        debugShortcut={false}
        keyMap={testing ? undefined : null}
        onKey={onKey}
        bodyOverlay={
          testing ? null : (
            <>
              <EditableRect
                rect={screen}
                label="screen"
                color="rgba(155,188,15,0.45)"
                selected={selected === SCREEN_SELECTION}
                onSelect={() => onSelect(SCREEN_SELECTION)}
                onChange={onScreenChange}
                boxOf={boxOf}
              />
              {zones.map((zone) => (
                <EditableRect
                  key={zone.key}
                  rect={zone}
                  label={zone.label}
                  color={zone.debugColor ?? "rgba(255,0,0,0.3)"}
                  selected={selected === zone.key}
                  onSelect={() => onSelect(zone.key)}
                  onChange={(rect) => onZoneChange(zone.key, rect)}
                  boxOf={boxOf}
                />
              ))}
            </>
          )
        }
      >
        {testing && (
          <div className="flex h-full w-full flex-col items-center justify-center text-center">
            <div className="text-[3cqw]">LAST KEY</div>
            <div className="mt-[2cqw] text-[4.5cqw] font-bold">
              {lastKey ?? "none"}
            </div>
          </div>
        )}
      </Phone>
    </div>
  );
}
