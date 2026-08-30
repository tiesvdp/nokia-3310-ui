import { defineScreen } from "@/lib/helpers/defineScreen";
import type { ScreenRegistry } from "@/lib/interfaces/flow";
import { bootScreen, type BootStep } from "./boot";
import { chatScreen, type ChatStep } from "./chat";
import { confirmScreen, type ConfirmStep } from "./confirm";
import { multiSelectScreen, type MultiSelectStep } from "./multiSelect";
import { noticeScreen, type NoticeStep } from "./notice";
import { photoScreen, type PhotoStep } from "./photo";
import { selectScreen, type SelectStep } from "./select";
import { textScreen, type TextStep } from "./text";

export const builtinScreens: ScreenRegistry = {
  boot: defineScreen(bootScreen),
  notice: defineScreen(noticeScreen),
  chat: defineScreen(chatScreen),
  photo: defineScreen(photoScreen),
  text: defineScreen(textScreen),
  select: defineScreen(selectScreen),
  multiSelect: defineScreen(multiSelectScreen),
  confirm: defineScreen(confirmScreen),
};

/** Every step shape the built-in screens understand. */
export type BuiltinStep =
  | BootStep
  | NoticeStep
  | ChatStep
  | PhotoStep
  | TextStep
  | SelectStep
  | MultiSelectStep
  | ConfirmStep;

export { Caret, Header, Navi, ScrollHint } from "./chrome";
export { bootScreen, type BootStep } from "./boot";
export {
  chatScreen,
  type ChatStep,
  type ChatMessage,
  type ChatValue,
} from "./chat";
export { confirmScreen, type ConfirmStep } from "./confirm";
export {
  multiSelectScreen,
  type MultiSelectStep,
  type MultiSelectValue,
} from "./multiSelect";
export { noticeScreen, type NoticeStep } from "./notice";
export { photoScreen, type PhotoStep } from "./photo";
export { selectScreen, type SelectStep } from "./select";
export { textScreen, type TextStep } from "./text";
