// Background renderer.
//
// Nebulae are pre-rendered ONCE to a single offscreen canvas and blitted each
// frame (instead of rebuilding 3 radial gradients per frame). Twinkling
// parallax stars are plain arc() fills — cheap by nature.

import { STAR_COLORS } from "./config.js";

export function createBackground() {
  let nebulaCanvas = null;

  function buildNebulae(W, H) {
    nebulaCanvas = document.createElement("canvas");
    nebulaCanvas.width = W;
    nebulaCanvas.height = H;
    const ctx = nebulaCanvas.getContext("2d");

    for (let i = 0; i < 3; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H * 0.7;
      const r = 120 + Math.random() * 140;
      const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, color + "22");
      grad.addColorStop(1, color + "00");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Three parallax layers of twinkling background stars.
  const bgLayers = [[], [], []];
  const LAYER_COUNTS = [40, 26, 14];
  const LAYER_SIZES = [1, 1.8, 2.6];
  const LAYER_SPEEDS = [6, 14, 26];

  function init(W, H) {
    bgLayers.forEach((layer, L) => {
      layer.length = 0;
      for (let i = 0; i < LAYER_COUNTS[L]; i++) {
        layer.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: LAYER_SIZES[L] * (0.6 + Math.random() * 0.8),
          tw: Math.random() * Math.PI * 2,
          speed: LAYER_SPEEDS[L],
        });
      }
    });
    buildNebulae(W, H);
  }

  function draw(ctx, W, H, t) {
    // Gradient sky.
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#05040f");
    g.addColorStop(0.5, "#0e0826");
    g.addColorStop(1, "#1a0f3a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Pre-rendered nebulae — single blit.
    if (nebulaCanvas) {
      ctx.drawImage(nebulaCanvas, 0, 0);
    }

    // Twinkling stars.
    ctx.fillStyle = "#fff";
    for (let L = 0; L < bgLayers.length; L++) {
      const layer = bgLayers[L];
      for (let i = 0; i < layer.length; i++) {
        const s = layer[i];
        ctx.globalAlpha = 0.35 + 0.55 * Math.abs(Math.sin(t / 900 + s.tw));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        s.y += s.speed * 0.004;
        if (s.y > H + 5) s.y = -5;
      }
    }
    ctx.globalAlpha = 1;
  }

  return { init, draw };
}
