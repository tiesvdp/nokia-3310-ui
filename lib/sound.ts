import type { Sound, SoundOptions } from "./interfaces/sound";

const SILENT: Sound = {
  keyClick() {},
  messageReceived() {},
  screenTransition() {},
  success() {},
  error() {},
  shutter() {},
  ringtone() {},
  unlock() {},
  setVolume() {},
};

/** Creates a sound instance with the given options. */
export function createSound(options: SoundOptions = {}): Sound {
  if (typeof window === "undefined") return SILENT;

  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let volume = options.volume ?? 1;
  const samples = new Map<string, HTMLAudioElement>();

  function unlock() {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
  }

  // A suspended context still accepts scheduled notes and fires them all at
  // once when it resumes, so sounds are dropped until it is actually running.
  function live(): AudioContext | null {
    unlock();
    return ctx && ctx.state === "running" ? ctx : null;
  }

  function tone(
    at: number,
    freq: number,
    duration: number,
    type: OscillatorType = "square",
    gain = 0.08,
  ) {
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env);
    env.connect(master);
    osc.frequency.value = freq;
    osc.type = type;
    env.gain.setValueAtTime(gain, at);
    env.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.start(at);
    osc.stop(at + duration + 0.01);
  }

  function melody(
    notes: Array<[freq: number, offset: number]>,
    duration: number,
    type: OscillatorType = "square",
    gain = 0.08,
  ) {
    const audio = live();
    if (!audio) return;
    const now = audio.currentTime;
    for (const [freq, offset] of notes) {
      tone(now + offset, freq, duration, type, gain);
    }
  }

  function sample(url: string | undefined) {
    if (!url) return false;
    let element = samples.get(url);
    if (!element) {
      element = new Audio(url);
      element.preload = "auto";
      samples.set(url, element);
    }
    element.currentTime = 0;
    void element.play().catch(() => {});
    return true;
  }

  return {
    keyClick() {
      melody([[1400, 0]], 0.018, "square", 0.07);
    },
    messageReceived() {
      melody(
        [
          [1200, 0],
          [1200, 0.1],
          [1600, 0.2],
        ],
        0.06,
      );
    },
    screenTransition() {
      melody(
        [
          [523, 0],
          [659, 0.06],
        ],
        0.05,
        "square",
        0.06,
      );
    },
    success() {
      melody(
        [
          [523, 0],
          [659, 0.13],
          [784, 0.26],
          [1047, 0.39],
        ],
        0.2,
      );
    },
    error() {
      melody(
        [
          [220, 0],
          [180, 0.15],
        ],
        0.3,
        "sawtooth",
        0.1,
      );
    },
    shutter() {
      if (sample(options.samples?.shutter)) return;
      melody(
        [
          [2400, 0],
          [900, 0.03],
        ],
        0.03,
        "square",
        0.09,
      );
    },
    ringtone() {
      sample(options.samples?.ringtone);
    },
    unlock,
    setVolume(next: number) {
      volume = next;
      if (master) master.gain.value = next;
    },
  };
}

export { SILENT as silentSound };
