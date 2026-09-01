"use client";

import { useState } from "react";
import type { Skin } from "@/lib/interfaces/skin";
import { BUTTON } from "./ui";

interface Props {
  skin: Skin;
  onReset(): void;
}

export function ExportPanel({ skin, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(skin, null, 2);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={BUTTON}
          onClick={() => {
            void navigator.clipboard.writeText(json);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button type="button" className={BUTTON} onClick={onReset}>
          Reset
        </button>
      </div>
      <p className="mt-2 text-xs text-neutral-400">
        Put these values in config/skin.ts and your photo in public/img.
      </p>
      <pre className="mt-3 max-h-64 overflow-auto rounded border border-neutral-800 bg-neutral-950 p-3 font-mono text-[0.66rem] leading-relaxed">
        {json}
      </pre>
    </>
  );
}
