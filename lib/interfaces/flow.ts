import type { ReactNode } from "react";
import type { KeyAction } from "@/lib/enums/keyAction";
import type { SubmitStatus } from "@/lib/enums/submitStatus";
import type { Sound } from "./sound";

export interface SubmitState {
  status: SubmitStatus;
  error: string | null;
}

/** What a screen can do to the flow it lives in. */
export interface FlowContext {
  answers: Record<string, unknown>;
  next(): void;
  back(): void;
  goto(stepId: string): void;
  submit(): void;
  alert(message: string): void;
  sound: Sound;
  submitState: SubmitState;
}

/** A flow context bound to one screen's own state. */
export interface ScreenContext<V = unknown> extends FlowContext {
  value: V;
  setValue(next: V | ((prev: V) => V)): void;
}

/**
 * A single step in the flow.
 * @id A unique identifier for this step, used to store its value in the flow's answers.
 * @type The type of this step, which determines which screen renders it.
 * @render An optional custom render function for this step, overriding the default screen rendering.
 * @key Any additional properties specific to this step type.
 */
export interface Step {
  id: string;
  type: string;
  // Replaces the built-in rendering for this step only
  render?(props: ScreenRenderProps): ReactNode;
  [key: string]: unknown;
}

export interface ScreenRenderProps<S extends Step = Step, V = unknown> {
  step: S;
  value: V;
  ctx: ScreenContext<V>;
}

/**
 * A screen type defines how a step is rendered and how it interacts with the flow.
 * It is registered in the flow registry and used to render steps of a matching type.
 */
export interface ScreenType<S extends Step = Step, V = unknown> {
  initialValue?(step: S): V;
  keyClick?(action: KeyAction, ctx: ScreenContext<V>, step: S): boolean;
  handleKey?(action: KeyAction, ctx: ScreenContext<V>, step: S): void;
  toAnswer?(value: V, step: S): unknown;
  render(props: ScreenRenderProps<S, V>): ReactNode;
}

/** What the registry stores: any screen, with its own types erased. */
export type ErasedScreen = ScreenType<Step, unknown>;

export type ScreenRegistry = Record<string, ErasedScreen>;

export interface FlowState {
  index: number;
  values: Record<string, unknown>;
  alert: string | null;
  submit: SubmitState;
}

/** A running flow */
export interface Flow {
  state: FlowState;
  step: Step;
  screen: ErasedScreen;
  answers: Record<string, unknown>;
  ctx: ScreenContext;
  handleKey(action: KeyAction): void;
}
