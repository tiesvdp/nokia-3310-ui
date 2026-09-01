"use client";

import { useMemo, useState } from "react";
import { ExportPanel } from "@/components/studio/ExportPanel";
import { ImagePicker } from "@/components/studio/ImagePicker";
import { PalettePicker } from "@/components/studio/PalettePicker";
import { RectFields } from "@/components/studio/RectFields";
import { StudioStage } from "@/components/studio/StudioStage";
import { ZonePicker } from "@/components/studio/ZonePicker";
import {
  SECTION_TITLE,
  FIELD,
  FIELD_LABEL,
  toggle,
} from "@/components/studio/ui";
import { nokia3310, ZONES } from "@/config/skin";
import { draftToSkin, useNudgeKeys, useSkinDraft } from "@/hooks/useSkinDraft";
import type { KeyAction } from "@/lib/enums/keyAction";
import type { SkinDraft } from "@/lib/interfaces/skinDraft";
import type { Skin } from "@/lib/interfaces/skin";

const INITIAL_DRAFT: SkinDraft = {
  name: nokia3310.name,
  aspectRatio: nokia3310.aspectRatio,
  screen: { ...nokia3310.screen },
  screenClip: nokia3310.screenClip ?? "",
  zones: ZONES.map((zone) => ({ ...zone })),
  palette: { ...nokia3310.palette },
  scanlines: nokia3310.scanlines ?? true,
};

/**
 * A page that allows the user to edit a skin for the Nokia 3310 UI or their own custom skin.
 */
export default function SkinStudio() {
  const {
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
  } = useSkinDraft(INITIAL_DRAFT);

  const [image, setImage] = useState(nokia3310.image);
  const [imagePath, setImagePath] = useState(nokia3310.image);
  const [testing, setTesting] = useState(false);
  const [lastKey, setLastKey] = useState<KeyAction | null>(null);

  useNudgeKeys(!testing, nudge);

  const skin: Skin = useMemo(
    () => ({
      ...draftToSkin(draft, image),
      zones: testing ? draft.zones : [],
    }),
    [draft, image, testing],
  );

  const exported = draftToSkin(draft, imagePath);

  return (
    <main className="grid min-h-dvh grid-rows-[minmax(0,1fr)_auto] bg-neutral-950 text-neutral-100 lg:h-dvh lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1">
      <StudioStage
        skin={skin}
        zones={draft.zones}
        screen={draft.screen}
        selected={selected}
        testing={testing}
        lastKey={lastKey}
        onSelect={setSelected}
        onScreenChange={updateScreen}
        onZoneChange={updateZone}
        onKey={setLastKey}
      />

      <aside className="flex flex-col gap-5 overflow-y-auto border-t border-neutral-800 bg-neutral-900 p-5 lg:border-t-0 lg:border-l">
        <div>
          <h1 className="text-sm font-semibold">Skin studio</h1>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            Drop in a photo of any phone, drag the zones onto its keys, then
            paste the result into config/skin.ts. Arrow keys nudge the
            selection, Shift with an arrow moves it further.
          </p>
        </div>

        <section>
          <h2 className={SECTION_TITLE}>Phone image</h2>
          <ImagePicker
            aspectRatio={draft.aspectRatio}
            onPick={(file, url, ratio) => {
              setAspectRatio(ratio);
              setImage(url);
              setImagePath(`/img/${file.name}`);
            }}
          />
        </section>

        <section>
          <h2 className={SECTION_TITLE}>Mode</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={toggle(!testing)}
              onClick={() => setTesting(false)}
            >
              Edit zones
            </button>
            <button
              type="button"
              className={toggle(testing)}
              onClick={() => setTesting(true)}
            >
              Test keys
            </button>
          </div>
        </section>

        {!testing && (
          <>
            <section>
              <h2 className={SECTION_TITLE}>Zones</h2>
              <ZonePicker
                zones={draft.zones}
                selected={selected}
                onSelect={setSelected}
              />
            </section>

            <section>
              <h2 className={SECTION_TITLE}>
                {selectedZone ? selectedZone.label : "Screen"}
              </h2>
              {selectedZone ? (
                <RectFields
                  rect={selectedZone}
                  withRotation
                  onChange={(patch) => updateZone(selectedZone.key, patch)}
                />
              ) : (
                <>
                  <RectFields rect={draft.screen} onChange={updateScreen} />
                  <label className={`${FIELD_LABEL} mt-2`}>
                    clip-path
                    <input
                      type="text"
                      className={FIELD}
                      placeholder="polygon(...)"
                      value={draft.screenClip}
                      onChange={(event) => setScreenClip(event.target.value)}
                    />
                  </label>
                </>
              )}
            </section>
          </>
        )}

        <section>
          <h2 className={SECTION_TITLE}>Palette</h2>
          <PalettePicker palette={draft.palette} onChange={setPaletteColour} />
        </section>

        <section>
          <h2 className={SECTION_TITLE}>Export</h2>
          <ExportPanel skin={exported} onReset={reset} />
        </section>
      </aside>
    </main>
  );
}
