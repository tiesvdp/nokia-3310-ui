export function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Formats a number as a CSS percentage, rounded to two decimals. */
export function toPercent(value: number) {
  return `${round(value, 2)}%`;
}

/** Reads the number out of a CSS percentage. Returns 0 for anything unparsable. */
export function fromPercent(value: string) {
  return Number.parseFloat(value) || 0;
}

/** Clamps a number between a minimum and maximum value. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
