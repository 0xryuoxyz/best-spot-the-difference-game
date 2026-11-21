// All sound comes from the Web Audio oscillator — no sound files, no network.
// A found difference plays a bright two-note chime, a wrong click a low buzz,
// a cleared round a rising arpeggio. Everything is guarded so the game still
// runs in a browser without audio (or before the first user gesture).

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context !== null) return context;
    try {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }

  /** Resume the context after a user gesture; safe to call any time. */
  function unlock() {
    const ctx = ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }

  function tone(frequency, startAt, duration, type, volume) {
    const ctx = ensure();
    if (!ctx || muted) return;
    try {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
      gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(ctx.currentTime + startAt);
      oscillator.stop(ctx.currentTime + startAt + duration + 0.05);
    } catch {
      // Audio is decoration; a failure here must never break the game.
    }
  }

  return {
    unlock,
    setMuted(value) {
      muted = value;
    },
    isMuted() {
      return muted;
    },
    found() {
      tone(660, 0, 0.16, 'sine', 0.22);
      tone(880, 0.09, 0.22, 'sine', 0.22);
    },
    wrong() {
      tone(140, 0, 0.22, 'sawtooth', 0.12);
    },
    hint() {
      tone(520, 0, 0.12, 'sine', 0.16);
      tone(780, 0.08, 0.14, 'sine', 0.16);
    },
    roundClear() {
      tone(523, 0, 0.14, 'sine', 0.2);
      tone(659, 0.12, 0.14, 'sine', 0.2);
      tone(784, 0.24, 0.2, 'sine', 0.2);
      tone(1047, 0.38, 0.3, 'sine', 0.2);
    },
    win() {
      [523, 659, 784, 1047, 1319].forEach((frequency, i) => {
        tone(frequency, i * 0.13, 0.26, 'sine', 0.2);
      });
    },
    gameOver() {
      tone(392, 0, 0.25, 'triangle', 0.18);
      tone(311, 0.22, 0.35, 'triangle', 0.18);
    },
  };
}
