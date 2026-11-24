// The success page's sound (Maria, 24 November 2026): soft, calm, plainly a "yes". The same lyre as
// lyre.mjs, but three strings plucked one after another, slowly rising: the tonic, its fifth, its octave
// (A3, E4, A4 in Pythagorean ratios), gentle plectrum, long ring.
// node scripts/audio/success.mjs out.wav, then through ffmpeg (high-pass 120 Hz, a soft echo, loudness
// -24 LUFS) to public/audio/success.mp3
import { writeFileSync } from 'node:fs';
const SR = 44100, LEN = 4.2, base = 220; // A3
const notes = [
  { r: 1, at: 0.05, gain: 0.5 },
  { r: 3 / 2, at: 0.42, gain: 0.44 },
  { r: 2, at: 0.82, gain: 0.46 },
];
const out = new Float32Array(Math.round(SR * LEN));
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
notes.forEach(({ r, at, gain }, i) => {
  const f = base * r;
  const N = Math.round(SR / f);
  const line = new Float32Array(N);
  // a softer pluck than the seminar's lyre: the burst smoothed twice (a fingertip more than a plectrum)
  let p1 = 0, p2 = 0;
  for (let k = 0; k < N; k++) { p1 = 0.35 * rnd() + 0.65 * p1; p2 = 0.5 * p1 + 0.5 * p2; line[k] = p2; }
  const start = Math.round(SR * at);
  const decay = 0.9984 - i * 0.0002; // a long ring
  let idx = 0;
  for (let t = start; t < out.length; t++) {
    const a = line[idx], b = line[(idx + 1) % N];
    line[idx] = decay * 0.5 * (a + b);
    idx = (idx + 1) % N;
    out[t] += a * gain;
  }
});
// a gentle fade at the very end
const fade = Math.round(SR * 0.6);
for (let t = 0; t < fade; t++) out[out.length - 1 - t] *= t / fade;
const data = Buffer.alloc(out.length * 2);
let peak = 0; for (const v of out) peak = Math.max(peak, Math.abs(v));
out.forEach((v, i) => data.writeInt16LE(Math.round((v / peak) * 0.9 * 32767), i * 2));
const head = Buffer.alloc(44);
head.write('RIFF', 0); head.writeUInt32LE(36 + data.length, 4); head.write('WAVE', 8); head.write('fmt ', 12);
head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(1, 22); head.writeUInt32LE(SR, 24);
head.writeUInt32LE(SR * 2, 28); head.writeUInt16LE(2, 32); head.writeUInt16LE(16, 34); head.write('data', 36); head.writeUInt32LE(data.length, 40);
writeFileSync(process.argv[2], Buffer.concat([head, data]));
