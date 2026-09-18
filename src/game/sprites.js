// Pre-baked sprite cache.
//
// The old renderer called ctx.shadowBlur and ctx.createRadialGradient for
// every star / trail point / particle every frame — the two most expensive
// canvas operations. Here every sprite is rendered ONCE to a small offscreen
// canvas and the frame loop only does drawImage(), which is GPU-accelerated.

import { STAR_COLORS, STAR_COLORS_RGB } from "./config.js";

const sprites = {
  star: [], // one per color
  particle: [], // one per color
  glow: [], // soft radial glow per color (trail points)
};

function makeCanvas(size) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  return c;
}

// 4-spike star shape path, centered in a size x size box.
function starPath(ctx, size) {
  const outerR = size / 2;
  const innerR = outerR * 0.42;
  const spikes = 4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function bakeStar(color) {
  // Glow padding around the star so shadowBlur is baked in.
  const pad = 24;
  const size = 64 + pad * 2;
  const c = makeCanvas(size);
  const ctx = c.getContext("2d");

  ctx.translate(size / 2, size / 2);
  ctx.shadowColor = color;
  ctx.shadowBlur = pad;
  ctx.fillStyle = color;
  starPath(ctx, 64);
  ctx.fill();

  // Bright center (baked, not drawn per frame).
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(0, 0, 64 * 0.28, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

function bakeParticle(color) {
  const size = 16;
  const c = makeCanvas(size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = color;
  // Small 4-spike sparkle.
  starPath(ctx, size);
  ctx.fill();
  return c;
}

function bakeGlow(color, rgb) {
  const size = 64;
  const c = makeCanvas(size);
  const ctx = c.getContext("2d");
  const r = size / 2;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`);
  grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return c;
}

export function initSprites() {
  if (sprites.star.length) return; // already baked
  for (let i = 0; i < STAR_COLORS.length; i++) {
    sprites.star.push(bakeStar(STAR_COLORS[i]));
    sprites.particle.push(bakeParticle(STAR_COLORS[i]));
    sprites.glow.push(bakeGlow(STAR_COLORS[i], STAR_COLORS_RGB[i]));
  }
}

export function getStarSprite(colorIndex) {
  return sprites.star[colorIndex];
}

export function getParticleSprite(colorIndex) {
  return sprites.particle[colorIndex];
}

export function getGlowSprite(colorIndex) {
  return sprites.glow[colorIndex];
}
