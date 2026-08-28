export interface SoundOptions {
  volume?: number;
  samples?: { shutter?: string; ringtone?: string };
}

/** A sound interface that provides methods for playing various sound effects and controlling volume. */
export interface Sound {
  keyClick(): void;
  messageReceived(): void;
  screenTransition(): void;
  success(): void;
  error(): void;
  shutter(): void;
  ringtone(): void;
  unlock(): void;
  setVolume(volume: number): void;
}
