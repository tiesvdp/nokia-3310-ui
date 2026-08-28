import { KeyAction } from "./enums/keyAction";

/** Maps physical keyboard keys onto phone keys. Tested on AZERTY keyboards, but should work on other layouts as well. */
export const DEFAULT_KEY_MAP: Record<string, KeyAction> = {
  ArrowLeft: KeyAction.NavLeft,
  ArrowUp: KeyAction.NavLeft,
  ArrowRight: KeyAction.NavRight,
  ArrowDown: KeyAction.NavRight,
  Enter: KeyAction.Center,
  Escape: KeyAction.Clear,
  Backspace: KeyAction.Clear,
  " ": KeyAction.Key0,
  "0": KeyAction.Key0,
  "1": KeyAction.Key1,
  "2": KeyAction.Key2,
  "3": KeyAction.Key3,
  "4": KeyAction.Key4,
  "5": KeyAction.Key5,
  "6": KeyAction.Key6,
  "7": KeyAction.Key7,
  "8": KeyAction.Key8,
  "9": KeyAction.Key9,
  "*": KeyAction.Star,
  "#": KeyAction.Hash,
};
