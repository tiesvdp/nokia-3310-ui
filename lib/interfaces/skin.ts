import type { KeyAction } from "@/lib/enums/keyAction";
import type { Rect } from "./rect";

/** A clickable region on the phone photo, in percentages of the image box. */
export interface ButtonZone extends Rect {
  key: KeyAction;
  label: string;
  debugColor?: string;
}

/** The only place the screen colours are defined. */
export interface Palette {
  bg: string;
  dark: string;
  mid: string;
  light: string;
}

/** A skin defines the visual appearance of the phone. */
export interface Skin {
  name: string;
  image: string;
  aspectRatio: number;
  screen: Rect;
  screenClip?: string;
  palette: Palette;
  scanlines?: boolean;
  zones: ButtonZone[];
}
