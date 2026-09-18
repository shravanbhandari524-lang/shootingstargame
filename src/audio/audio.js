// Audio helpers — lazily-created AudioContext, all calls safe if blocked.
let actx = null;

export function ac() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  return actx;
}

export function resume() {
  if (actx && actx.state === "suspended") actx.resume();
}

function tone(freq, t0, dur, type, vol, detune) {
  const a = ac();
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type || "sine";
  o.frequency.value = freq;
  if (detune) o.detune.value = detune;
  g.gain.setValueAtTime(0.0001, a.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(vol, a.currentTime + t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + t0);
  o.stop(a.currentTime + t0 + dur + 0.02);
}

function shimmer(t0, dur, vol) {
  const a = ac();
  const n = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, n, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++)
    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.5);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filt = a.createBiquadFilter();
  filt.type = "highpass";
  filt.frequency.value = 4500;
  const g = a.createGain();
  g.gain.setValueAtTime(vol, a.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
  src.connect(filt).connect(g).connect(a.destination);
  src.start(a.currentTime + t0);
}

export function hitSfx(perfect) {
  try {
    const base = perfect ? 880 : 660;
    tone(base, 0, 0.16, "triangle", 0.22);
    tone(base * 1.5, 0.01, 0.18, "sine", 0.14);
    tone(base * 2, 0.02, 0.14, "sine", 0.08, 6);
    shimmer(0, 0.22, 0.1);
    if (perfect) tone(base * 2.5, 0.06, 0.22, "sine", 0.12);
  } catch {
    // Audio unavailable — stay silent.
  }
}

export function comboSfx(step) {
  try {
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 987.77];
    const f = notes[Math.min(step, notes.length - 1)];
    tone(f, 0, 0.2, "triangle", 0.2);
    tone(f * 2, 0.02, 0.16, "sine", 0.1);
    shimmer(0, 0.25, 0.09);
  } catch {
    // Audio unavailable — stay silent.
  }
}

export function missSfx() {
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(340, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(90, a.currentTime + 0.28);
    g.gain.setValueAtTime(0.001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.13, a.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.3);
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.32);
  } catch {
    // Audio unavailable — stay silent.
  }
}

export function levelCompleteSfx() {
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      tone(f, i * 0.09, 0.35, "triangle", 0.18);
      tone(f * 2, i * 0.09 + 0.02, 0.25, "sine", 0.08);
    });
    shimmer(0.1, 0.6, 0.14);
  } catch {
    // Audio unavailable — stay silent.
  }
}

export function gameOverSfx() {
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(440, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(110, a.currentTime + 0.9);
    g.gain.setValueAtTime(0.001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.16, a.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.95);
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + 1);
  } catch {
    // Audio unavailable — stay silent.
  }
}

export function vibrate(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}
