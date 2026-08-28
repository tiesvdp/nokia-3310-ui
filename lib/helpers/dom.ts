const FORM_FIELDS = "input, textarea, select, [contenteditable='true']";

/** True when the event target is inside something the user is typing in */
export function isFormField(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(FORM_FIELDS) !== null;
}
