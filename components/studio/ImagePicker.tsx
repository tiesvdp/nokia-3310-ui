"use client";

interface Props {
  aspectRatio: number;
  onPick(file: File, url: string, aspectRatio: number): void;
}

export function ImagePicker({ aspectRatio, onPick }: Props) {
  return (
    <>
      <input
        type="file"
        accept="image/*"
        className="w-full text-xs text-neutral-400"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          const probe = new window.Image();
          probe.onload = () =>
            onPick(file, url, probe.naturalWidth / probe.naturalHeight);
          probe.src = url;
        }}
      />
      <p className="mt-2 text-xs text-neutral-400">
        Aspect ratio {aspectRatio.toFixed(4)}, read from the image.
      </p>
    </>
  );
}
