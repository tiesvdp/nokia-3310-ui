"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { DEFAULT_KEY_MAP } from "@/lib/keyboard";
import { isFormField } from "@/lib/helpers/dom";
import type { KeyAction } from "@/lib/enums/keyAction";
import type { Skin } from "@/lib/interfaces/skin";

export interface PhoneProps {
  skin: Skin;
  onKey?(action: KeyAction): void;
  children?: ReactNode;
  overlay?: ReactNode;
  bodyOverlay?: ReactNode;
  debug?: boolean;
  onDebugChange?(debug: boolean): void;
  debugShortcut?: boolean;
  keyMap?: Record<string, KeyAction> | null;
  className?: string;
  onImageLoad?(): void;
}

// Activate on Enter or Space
const ACTIVATION_KEYS = new Set(["Enter", " "]);

const PHONE_KEY_ATTRIBUTE = "data-phone-key";

function isPhoneKey(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(`[${PHONE_KEY_ATTRIBUTE}]`) !== null
  );
}

/**
 * Renders a phone UI with a given skin, handles key presses and optional debug overlay.
 * @param skin The skin configuration for the phone, including image, screen area, and key zones.
 * @param onKey Callback function invoked when a key is pressed, receiving the corresponding KeyAction.
 * @param children The content to render inside the phone's screen area.
 * @param overlay Optional overlay content to render on top of the screen area.
 * @param bodyOverlay Optional overlay content to render on top of the phone body.
 * @param debug Whether to show debug information, such as key zones. Default is false.
 * @param onDebugChange Callback function invoked when the debug state changes.
 * @param debugShortcut Whether to enable the Shift+D keyboard shortcut to toggle debug mode. Default is true.
 * @param keyMap Optional mapping of physical keyboard keys to KeyActions. Pass null to disable keyboard handling.
 * @param className Additional CSS classes to apply to the phone container.
 * @param onImageLoad Callback function invoked when the phone image has finished loading.
 */
export function Phone({
  skin,
  onKey,
  children,
  overlay,
  bodyOverlay,
  debug,
  onDebugChange,
  debugShortcut = true,
  keyMap = DEFAULT_KEY_MAP,
  className,
  onImageLoad,
}: PhoneProps) {
  const [pressed, setPressed] = useState<KeyAction | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [ownDebug, setOwnDebug] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<HTMLImageElement>(null);

  const debugOn = debug ?? ownDebug;

  const onKeyRef = useRef(onKey);
  useEffect(() => {
    onKeyRef.current = onKey;
  }, [onKey]);

  // A cached image finishes loading before hydration, so onLoad never fires
  useEffect(() => {
    setLoaded(!skin.image || !!bodyRef.current?.complete);
  }, [skin.image]);

  const press = useCallback((action: KeyAction) => {
    setPressed(action);
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressed(null), 100);
    onKeyRef.current?.(action);
  }, []);

  useEffect(
    () => () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
    },
    [],
  );

  /* Handle keyboard shortcuts */
  useEffect(() => {
    if (!keyMap) return;
    const handler = (event: KeyboardEvent) => {
      if (isFormField(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // A focused key button activates itself, so leave activation keys to it
      if (ACTIVATION_KEYS.has(event.key) && isPhoneKey(event.target)) return;
      const action = keyMap[event.key];
      if (!action) return;
      event.preventDefault();
      press(action);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyMap, press]);

  /* Toggle debug mode with Shift+D */
  useEffect(() => {
    if (!debugShortcut) return;
    const handler = (event: KeyboardEvent) => {
      if (!event.shiftKey || event.key.toLowerCase() !== "d") return;
      event.preventDefault();
      const next = !(debug ?? ownDebug);
      setOwnDebug(next);
      onDebugChange?.(next);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [debugShortcut, debug, ownDebug, onDebugChange]);

  const vars = {
    "--aspect": String(skin.aspectRatio),
    "--lcd-bg": skin.palette.bg,
    "--lcd-dark": skin.palette.dark,
    "--lcd-mid": skin.palette.mid,
    "--lcd-light": skin.palette.light,
  } as CSSProperties;

  return (
    <div className="relative flex h-full w-full items-center justify-center @container-size">
      <div
        className={`phone-frame relative touch-none select-none transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        style={vars}
      >
        {/* Phone screen */}
        <div
          role="group"
          aria-label={`${skin.name} screen`}
          aria-live="polite"
          className="absolute z-1 overflow-hidden bg-lcd-bg text-lcd-dark @container-size font-pixel"
          style={{
            top: skin.screen.top,
            left: skin.screen.left,
            width: skin.screen.width,
            height: skin.screen.height,
          }}
        >
          {/* Screen content */}
          <div className="absolute inset-0 px-[7cqw] py-[7cqh]">{children}</div>
          {overlay}
          {skin.scanlines && (
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)]" />
          )}
        </div>

        {/* Phone body image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bodyRef}
          src={skin.image}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 z-2 h-full w-full object-fill"
          onLoad={() => {
            setLoaded(true);
            onImageLoad?.();
          }}
        />

        {/* Key zones */}
        {skin.zones.map((zone) => (
          <button
            key={zone.key}
            type="button"
            data-phone-key={zone.key}
            aria-label={zone.label}
            className={`absolute z-3 flex touch-none cursor-pointer items-center justify-center rounded-sm transition-opacity outline-offset-2 focus-visible:outline-2 focus-visible:outline-white ${
              pressed === zone.key ? "opacity-30" : "opacity-100"
            }`}
            style={{
              top: zone.top,
              left: zone.left,
              width: zone.width,
              height: zone.height,
              backgroundColor: debugOn
                ? (zone.debugColor ?? "rgba(255,0,0,0.33)")
                : "transparent",
              ...(zone.rotate
                ? { transform: `rotate(${zone.rotate}deg)` }
                : null),
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              press(zone.key);
            }}
            onKeyDown={(event) => {
              if (!ACTIVATION_KEYS.has(event.key)) return;
              event.preventDefault();
              press(zone.key);
            }}
          >
            {debugOn && (
              <span className="truncate px-px text-[6px] leading-none font-bold text-black/80">
                {zone.label}
              </span>
            )}
          </button>
        ))}

        {bodyOverlay}
        {debugOn && (
          <div className="pointer-events-none absolute inset-x-0 bottom-1 z-50 text-center text-[8px] text-white/60">
            Shift+D turns the zones off
          </div>
        )}
      </div>
    </div>
  );
}
