import type { ErasedScreen, ScreenType, Step } from "@/lib/interfaces/flow";

/**
 * A helper function that defines a screen type for the flow system.
 * It ensures that the screen type is correctly typed and can be used in the flow registry.
 * @param screen The screen type to define, which includes the step type and the value type.
 * @returns The screen type as an erased screen
 */
export function defineScreen<S extends Step, V>(
  screen: ScreenType<S, V>,
): ErasedScreen {
  return screen as unknown as ErasedScreen;
}
