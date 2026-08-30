export type T9Map = Record<string, readonly string[]>;

/** A buffer for storing the current T9 input. */
export interface T9Buffer {
  text: string;
  pending: string;
  lastKey: string | null;
  count: number;
}

/** Options for configuring the T9 input behavior. */
export interface T9Options {
  map: T9Map;
  commitDelayMs?: number;
  autoCapitalise?: boolean;
  maxLength?: number;
}
