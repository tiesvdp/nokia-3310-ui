import type { ButtonZone, Palette } from "./skin";
import type { Rect } from "./rect";

/**
 * A draft of a skin, used in the studio to edit and export a skin.
 * This is not the same as the Skin type, which is used in the app.
 * The Skin type has a fixed image path and is read-only.
 */
export interface SkinDraft {
  name: string;
  aspectRatio: number;
  screen: Rect;
  zones: ButtonZone[];
  palette: Palette;
  scanlines: boolean;
}
