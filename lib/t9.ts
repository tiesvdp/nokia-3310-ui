"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { T9Buffer, T9Map, T9Options } from "./interfaces/t9";

export const EMPTY_T9: T9Buffer = {
  text: "",
  pending: "",
  lastKey: null,
  count: 0,
};

/** Keypad hints ("2" -> "abc"), for rendering under an input. */
export function t9Hints(map: T9Map): Record<string, string> {
  const hints: Record<string, string> = {};
  for (const [key, letters] of Object.entries(map))
    hints[key] = letters.join("");
  return hints;
}

function shouldCapitalise(text: string, options: T9Options) {
  if (options.autoCapitalise === false) return false;
  return text.length === 0 || text.endsWith(" ");
}

export function t9Commit(buf: T9Buffer): T9Buffer {
  if (!buf.pending) return { ...buf, lastKey: null, count: 0 };
  return { text: buf.text + buf.pending, pending: "", lastKey: null, count: 0 };
}

/**
 * Handle a digit press: cycle the same key, or commit and start a new letter.
 * @param buf The current T9 buffer.
 * @param key The digit that was pressed.
 * @param options The T9 options.
 * @returns The updated T9 buffer.
 */
export function t9Press(
  buf: T9Buffer,
  key: string,
  options: T9Options,
): T9Buffer {
  const letters = options.map[key];
  if (!letters || letters.length === 0) return buf;

  if (buf.lastKey === key && buf.pending) {
    const count = (buf.count + 1) % letters.length;
    const letter = letters[count]!;
    return {
      ...buf,
      pending: shouldCapitalise(buf.text, options)
        ? letter.toUpperCase()
        : letter,
      count,
    };
  }

  const committed = t9Commit(buf);
  if (
    options.maxLength !== undefined &&
    committed.text.length >= options.maxLength
  ) {
    return committed;
  }
  const letter = letters[0]!;
  return {
    ...committed,
    pending: shouldCapitalise(committed.text, options)
      ? letter.toUpperCase()
      : letter,
    lastKey: key,
    count: 0,
  };
}

/**
 * Append a literal character. Ex: Space on the 0 key.
 * @param buf The current T9 buffer.
 * @param char The character to append.
 * @param options The T9 options.
 */
export function t9Append(
  buf: T9Buffer,
  char: string,
  options: T9Options,
): T9Buffer {
  const committed = t9Commit(buf);
  if (
    options.maxLength !== undefined &&
    committed.text.length >= options.maxLength
  ) {
    return committed;
  }
  return { ...committed, text: committed.text + char };
}

/**
 * Handle a backspace: delete the pending letter, or the last committed letter.
 * @param buf The current T9 buffer.
 * @returns The updated T9 buffer and a flag indicating if the buffer is empty.
 */
export function t9Backspace(buf: T9Buffer): {
  buffer: T9Buffer;
  emptied: boolean;
} {
  if (buf.pending) {
    return {
      buffer: { ...buf, pending: "", lastKey: null, count: 0 },
      emptied: false,
    };
  }
  if (buf.text.length > 0) {
    return {
      buffer: { ...buf, text: buf.text.slice(0, -1), lastKey: null, count: 0 },
      emptied: false,
    };
  }
  return { buffer: { ...EMPTY_T9 }, emptied: true };
}

/**
 * Runs the idle commit timer for a buffer you hold in state.
 * @param buffer The current T9 buffer.
 * @param setBuffer The state setter for the buffer.
 * @param options The T9 options.
 * @returns A cleanup function to cancel the timer.
 */
export function useT9CommitTimer(
  buffer: T9Buffer,
  setBuffer: (next: T9Buffer) => void,
  options: T9Options,
) {
  // Default commit delay is 1.2s - the same as the original Nokia 3310
  const delay = options.commitDelayMs ?? 1200;
  const setRef = useRef(setBuffer);
  useEffect(() => {
    setRef.current = setBuffer;
  }, [setBuffer]);

  useEffect(() => {
    if (!buffer.pending) return;
    const timer = setTimeout(() => setRef.current(t9Commit(buffer)), delay);
    return () => clearTimeout(timer);
  }, [buffer, delay]);
}

/**
 * A hook that manages a T9 input buffer, including pending letters and commit timing.
 * @param options The T9 options.
 * @returns The T9 buffer and associated actions.
 */
export function useT9(options: T9Options) {
  const [buffer, setBuffer] = useState<T9Buffer>(EMPTY_T9);
  useT9CommitTimer(buffer, setBuffer, options);

  return {
    buffer,
    text: buffer.text,
    display: buffer.text + buffer.pending,
    press: useCallback(
      (key: string) => setBuffer((b) => t9Press(b, key, options)),
      [options],
    ),
    append: useCallback(
      (char: string) => setBuffer((b) => t9Append(b, char, options)),
      [options],
    ),
    commit: useCallback(() => setBuffer(t9Commit), []),
    /** Returns true when there was nothing left to delete. */
    backspace: useCallback(() => {
      const { buffer: next, emptied } = t9Backspace(buffer);
      setBuffer(next);
      return emptied;
    }, [buffer]),
    reset: useCallback(() => setBuffer(EMPTY_T9), []),
    setBuffer,
  };
}
