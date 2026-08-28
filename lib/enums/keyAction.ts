/* Every key the phone can report */
export enum KeyAction {
  Clear = "c",
  Center = "center",
  NavLeft = "navLeft",
  NavRight = "navRight",
  Key0 = "key0",
  Key1 = "key1",
  Key2 = "key2",
  Key3 = "key3",
  Key4 = "key4",
  Key5 = "key5",
  Key6 = "key6",
  Key7 = "key7",
  Key8 = "key8",
  Key9 = "key9",
  Star = "star",
  Hash = "hash",
}

/* The digit each numeric key types */
export const DIGIT_BY_KEY: Partial<Record<KeyAction, string>> = {
  [KeyAction.Key0]: "0",
  [KeyAction.Key1]: "1",
  [KeyAction.Key2]: "2",
  [KeyAction.Key3]: "3",
  [KeyAction.Key4]: "4",
  [KeyAction.Key5]: "5",
  [KeyAction.Key6]: "6",
  [KeyAction.Key7]: "7",
  [KeyAction.Key8]: "8",
  [KeyAction.Key9]: "9",
};
