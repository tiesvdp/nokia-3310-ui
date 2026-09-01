import type { KeyAction } from "@/lib/enums/keyAction";

export const SCREEN_SELECTION = "screen";

export type StudioSelection = KeyAction | typeof SCREEN_SELECTION;
