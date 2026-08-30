"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { builtinScreens } from "@/components/screens";
import type { KeyAction } from "@/lib/enums/keyAction";
import { SubmitStatus } from "@/lib/enums/submitStatus";
import type {
  ErasedScreen,
  Flow,
  FlowState,
  ScreenContext,
  ScreenRegistry,
  Step,
  SubmitState,
} from "@/lib/interfaces/flow";
import type { Sound } from "@/lib/interfaces/sound";

interface UseFlowOptions {
  flow: Step[];
  screens?: ScreenRegistry;
  onSubmit?(answers: Record<string, unknown>): void | Promise<void>;
  onComplete?(answers: Record<string, unknown>): void;
  sound: Sound;
}

const IDLE: SubmitState = { status: SubmitStatus.Idle, error: null };

/**
 * A hook that manages the state of a flow of screens.
 * @param options.flow The array of steps that make up the flow.
 * @param options.screens An optional registry of custom screen types.
 * @param options.onSubmit An optional callback that is called when the flow is submitted.
 * @param options.onComplete An optional callback that is called when the flow is completed.
 * @param options.sound The sound manager for playing audio feedback.
 */
export function useFlow({
  flow,
  screens,
  onSubmit,
  onComplete,
  sound,
}: UseFlowOptions): Flow {
  const registry = useMemo(
    () => ({ ...builtinScreens, ...screens }) as ScreenRegistry,
    [screens],
  );

  const [state, setState] = useState<FlowState>(() => {
    const values: Record<string, unknown> = {};
    for (const step of flow) {
      values[step.id] = registry[step.type]?.initialValue?.(step);
    }
    return { index: 0, values, alert: null, submit: IDLE };
  });

  const stateRef = useRef(state);

  const callbacks = useRef({ onSubmit, onComplete, sound });
  useEffect(() => {
    callbacks.current = { onSubmit, onComplete, sound };
  }, [onSubmit, onComplete, sound]);

  const update = useCallback((fn: (prev: FlowState) => FlowState) => {
    const next = fn(stateRef.current);
    stateRef.current = next;
    setState(next);
  }, []);

  /* Returns the screen for a given step. */
  const screenFor = useCallback(
    (step: Step): ErasedScreen => {
      const screen = registry[step.type];
      if (!screen) {
        throw new Error(
          `No screen type "${step.type}" for step "${step.id}". ` +
            `Register it with the screens prop.`,
        );
      }
      return screen;
    },
    [registry],
  );

  /* Converts the current values to a record of answers. */
  const answersFrom = useCallback(
    (values: Record<string, unknown>) => {
      const answers: Record<string, unknown> = {};
      for (const step of flow) {
        const toAnswer = registry[step.type]?.toAnswer;
        if (!toAnswer) continue;
        answers[step.id] = toAnswer(values[step.id], step);
      }
      return answers;
    },
    [flow, registry],
  );

  /* Submits the current flow. */
  const runSubmit = useCallback(() => {
    if (stateRef.current.submit.status !== SubmitStatus.Idle) return;
    update((s) => ({
      ...s,
      submit: { status: SubmitStatus.Pending, error: null },
    }));

    const answers = answersFrom(stateRef.current.values);
    void Promise.resolve()
      .then(() => callbacks.current.onSubmit?.(answers))
      .then(() => {
        update((s) => ({
          ...s,
          submit: { status: SubmitStatus.Done, error: null },
        }));
        callbacks.current.sound.success();
      })
      .catch((err: unknown) => {
        update((s) => ({
          ...s,
          submit: {
            status: SubmitStatus.Error,
            error: err instanceof Error ? err.message : String(err),
          },
        }));
        callbacks.current.sound.error();
      });
  }, [answersFrom, update]);

  /* Navigates to a specific index in the flow. */
  const goToIndex = useCallback(
    (index: number) => {
      if (index < 0) return;
      if (index >= flow.length) {
        callbacks.current.onComplete?.(answersFrom(stateRef.current.values));
        return;
      }
      if (flow[index]!.type === "confirm") runSubmit();
      update((s) => ({ ...s, index, alert: null }));
    },
    [answersFrom, flow, runSubmit, update],
  );

  /* Creates a context for a given step. */
  const makeContext = useCallback(
    (stepId: string): ScreenContext => ({
      get answers() {
        return answersFrom(stateRef.current.values);
      },
      get value() {
        return stateRef.current.values[stepId];
      },
      get submitState() {
        return stateRef.current.submit;
      },
      get sound() {
        return callbacks.current.sound;
      },
      setValue(next) {
        update((s) => {
          const prev = s.values[stepId];
          const value =
            typeof next === "function"
              ? (next as (p: unknown) => unknown)(prev)
              : next;
          return { ...s, values: { ...s.values, [stepId]: value } };
        });
      },
      next() {
        goToIndex(stateRef.current.index + 1);
      },
      back() {
        goToIndex(stateRef.current.index - 1);
      },
      goto(id) {
        const index = flow.findIndex((s) => s.id === id);
        if (index === -1) throw new Error(`No step with id "${id}"`);
        goToIndex(index);
      },
      submit() {
        runSubmit();
        goToIndex(stateRef.current.index + 1);
      },
      alert(message) {
        update((s) => ({ ...s, alert: message }));
        callbacks.current.sound.error();
      },
    }),
    [answersFrom, flow, goToIndex, runSubmit, update],
  );

  /* Returns a map of contexts for all steps in the flow. */
  const contexts = useMemo(() => {
    const map = new Map<string, ScreenContext>();
    // eslint-disable-next-line react-hooks/refs
    for (const step of flow) map.set(step.id, makeContext(step.id));
    return map;
  }, [flow, makeContext]);

  const handleKey = useCallback(
    (action: KeyAction) => {
      const current = stateRef.current;

      // Unlock the audio context on any key press.
      // No sound played otherwise.
      callbacks.current.sound.unlock();

      if (current.alert) {
        update((s) => ({ ...s, alert: null }));
        return;
      }

      const step = flow[current.index];
      if (!step) return;

      const screen = screenFor(step);
      const ctx = contexts.get(step.id)!;

      if (screen.keyClick?.(action, ctx, step) !== false) {
        callbacks.current.sound.keyClick();
      }
      screen.handleKey?.(action, ctx, step);
    },
    [contexts, flow, screenFor, update],
  );

  const step = flow[state.index] ?? flow[flow.length - 1]!;

  return {
    state,
    step,
    screen: screenFor(step),
    answers: answersFrom(state.values),
    ctx: contexts.get(step.id)!,
    handleKey,
  };
}
