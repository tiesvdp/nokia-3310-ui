"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Background component that fills the screen with a background image or default gradient.
 * @param src - The source URL of the background image. If not provided, a default radial gradient is used.
 * @param dim - The opacity of the black overlay to dim the background. Default = 0.
 * @param collapseSafariBar - Whether to scroll a pixel on load to collapse Safari's address bar. Default = true.
 * @param children - The child components to render on top of the background.
 */
export interface BackgroundProps {
  src?: string;
  dim?: number;
  // Mobile Safari hack: scroll a pixel on load to collapse the address bar
  collapseSafariBar?: boolean;
  children: ReactNode;
}

export function Background({
  src,
  dim = 0,
  collapseSafariBar = true,
  children,
}: BackgroundProps) {
  useEffect(() => {
    if (collapseSafariBar) window.scrollTo(0, 1);
  }, [collapseSafariBar]);

  return (
    <div className="relative min-h-dvh w-full">
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={
          src
            ? { backgroundImage: `url(${src})` }
            : {
                background:
                  "radial-gradient(120% 90% at 50% 0%, #1d2416, #0d0f0c)",
              }
        }
      />
      {dim > 0 && (
        <div
          className="fixed inset-0 -z-10 bg-black"
          style={{ opacity: dim }}
        />
      )}
      {children}
    </div>
  );
}
