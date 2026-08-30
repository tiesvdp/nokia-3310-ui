import type { T9Map } from "@/lib/interfaces/t9";

/**
 * Which letters each key cycles through. Swap these for another alphabet, or
 * set `t9Map` on a text step to use a different one for that screen only.
 */
export const DEFAULT_T9_MAP: T9Map = {
  "1": [".", ",", "!", "?", "-"],
  "2": ["a", "b", "c"],
  "3": ["d", "e", "f"],
  "4": ["g", "h", "i"],
  "5": ["j", "k", "l"],
  "6": ["m", "n", "o"],
  "7": ["p", "q", "r", "s"],
  "8": ["t", "u", "v"],
  "9": ["w", "x", "y", "z"],
};
