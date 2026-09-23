// Core game engine: pooled entities, sprite-based rendering, single loop.
//
// Performance strategy for 1000+ stars:
// - Fixed-size object pools (no allocations during the frame, no GC spikes).
// - Swap-remove instead of Array.splice (O(1) removal).
// - All drawing via drawImage of pre-baked sprites (see sprites.js).
// - dt-normalized physics so speed is framerate-independent.
// - Trail points drawn as one cheap glow sprite each (no gradients).

import {
  STAR_COLORS,
  LIVES_MAX,
  TRAIL_LENGTH,
  START_LEVEL,
  levelTargetFor,
  difficultyFor,
} from "./config.js";
import {
  initSprites,
  getStarSprite,
  getParticleSprite,
  getGlowSprite,
} from "./sprites.js";
import { createBackground } from "./background.js";
import * as audio from "../audio/audio.js";

const MAX_STARS = 1000;
const MAX_PARTICLES = 2000;

export function createEngine(canvas, callbacks) {
  const ctx = canvas.getContext("2d");
  const background = createBackground();

  let W = 0;
  let H = 0;
  let DPR = 1;

  // ---------------------------------------------------------------
  // POOLS — fixed-size, reused forever. Counters track active items.
  // ---------------------------------------------------------------
  const stars = new Array(MAX_STARS);
  for (let i = 0; i < MAX_STARS; i++) {
    stars[i] = {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      colorIndex: 0,
      spin: 0,
      spinSpeed: 0,
      born: 0,
      trail: null,
      trailLen: 0,
      trailHead: 0,
    };
  }
  let starCount = 0;

  const particles = new Array(MAX_PARTICLES);
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles[i] = {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      colorIndex: 0,
      star: false,
      size: 0,
      spin: 0,
      ring: false,
      r: 0,
      maxR: 0,
    };
  }
  let particleCount = 0;

  // Pre-allocate trail buffers (ring buffers, zero per-frame allocation).
  for (let i = 0; i < MAX_STARS; i++) {
    stars[i].trail = new Float32Array(TRAIL_LENGTH * 3); // x, y, colorIndex
  }

  // ---------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------
  let running = false;
  let paused = false;
  let rafId = null;
  let lastT = 0;
  let spawnTimer = 0;
  let shake = 0;
  let flashAlpha = 0;

  const game = {
    level: START_LEVEL,
    score: 0,
    lives: LIVES_MAX,
    combo: 0,
    bestCombo: 0,
    levelHits: 0,
    levelTarget: levelTargetFor(START_LEVEL),
  };
  const LEVEL_KEY = "currentlevel";

  function loadLevel() {
    try {
      const n = parseInt(localStorage.getItem(LEVEL_KEY), 10);
      return Number.isFinite(n) && n >= 1 ? n : 1;
    } catch {
      return 1; // storage blocked (private mode, etc.)
    }
  }

  function saveLevel(level) {
    try {
      localStorage.setItem(LEVEL_KEY, String(level));
    } catch {
      // storage blocked (private mode, etc.) — level just won't persist
    }
  }
  // ---------------------------------------------------------------
  // RESIZE (ResizeObserver — no window listener needed)
  // ---------------------------------------------------------------
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    background.init(W, H);
  }

  const ro = new ResizeObserver(resize);

  // ---------------------------------------------------------------
  // SPAWN
  // ---------------------------------------------------------------
  function spawnStar() {
    const diff = difficultyFor(game.level);
    if (starCount >= Math.min(diff.maxAlive, MAX_STARS)) return;

    const s = stars[starCount++];
    const side = Math.floor(Math.random() * 4);
    const margin = 40;
    let x, y, angle;

    if (side === 0) {
      x = -margin;
      y = Math.random() * H * 0.7;
      angle = -0.35 + Math.random() * 0.7;
    } else if (side === 1) {
      x = W + margin;
      y = Math.random() * H * 0.7;
      angle = Math.PI - (-0.35 + Math.random() * 0.7);
    } else if (side === 2) {
      x = Math.random() * W;
      y = -margin;
      angle = Math.PI / 2 + (-0.4 + Math.random() * 0.8);
    } else {
      x = Math.random() * W * 0.6 + W * 0.2;
      y = -margin;
      angle = Math.PI / 2.2;
    }

    const speed = diff.speed * (0.85 + Math.random() * 0.3);
    s.active = true;
    s.x = x;
    s.y = y;
    s.vx = Math.cos(angle) * speed;
    s.vy = Math.sin(angle) * speed + 1.4;
    s.size = diff.size;
    s.colorIndex = Math.floor(Math.random() * STAR_COLORS.length);
    s.spin = Math.random() * Math.PI * 2;
    s.spinSpeed = 0.12 + Math.random() * 0.08;
    s.born = performance.now();
    s.trailLen = 0;
    s.trailHead = 0;
  }

  function spawnBurst(x, y, colorIndex, big) {
    const count = big ? 36 : 20;
    for (let i = 0; i < count && particleCount < MAX_PARTICLES; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (big ? 3 : 1.8) + Math.random() * (big ? 7 : 4.5);
      const p = particles[particleCount++];
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s;
      p.life = 1;
      p.colorIndex = colorIndex;
      p.star = Math.random() < 0.5;
      p.size = 2 + Math.random() * (big ? 4 : 2.5);
      p.spin = Math.random() * Math.PI * 2;
      p.ring = false;
    }
    if (particleCount < MAX_PARTICLES) {
      const p = particles[particleCount++];
      p.active = true;
      p.x = x;
      p.y = y;
      p.ring = true;
      p.r = 4;
      p.maxR = big ? 90 : 60;
      p.life = 1;
      p.colorIndex = colorIndex;
    }
  }

  // ---------------------------------------------------------------
  // HIT / MISS — O(1) swap-remove keeps arrays dense with 1000s of items.
  // ---------------------------------------------------------------
  function removeStar(i) {
    starCount--;
    const tmp = stars[i];
    stars[i] = stars[starCount];
    stars[starCount] = tmp;
  }

  function handleHit(i) {
    const s = stars[i];
    const { x, y, colorIndex, born } = s;

    removeStar(i);

    game.combo++;
    if (game.combo > game.bestCombo) game.bestCombo = game.combo;

    const perfect = performance.now() - born < 260;
    const mult = 1 + Math.floor(game.combo / 5) * 0.5;
    game.score += Math.round((perfect ? 200 : 120) * mult);
    game.levelHits++;

    spawnBurst(x, y, colorIndex, perfect);
    shake = perfect ? 9 : 5;
    flashAlpha = perfect ? 0.18 : 0.08;
    audio.vibrate(perfect ? 22 : 12);
    audio.hitSfx(perfect);

    callbacks.onState(game);

    if (perfect) callbacks.onCombo("PERFECT!", "#ffd76b");
    if (game.combo > 0 && game.combo % 5 === 0) {
      callbacks.onCombo("STREAK x" + game.combo, STAR_COLORS[colorIndex]);
      audio.comboSfx(Math.floor(game.combo / 5));
    }

    if (game.levelHits >= game.levelTarget) {
      running = false;
      // Progress is persisted by App (with a max-guard), not here.
      clearStars();
      setTimeout(() => callbacks.onLevelComplete(), 350);
    }
  }

  function handleMiss(i) {
    removeStar(i);
    game.combo = 0;
    game.lives--;
    callbacks.onState(game);
    shake = 8;

    if (game.lives <= 0) {
      running = false;
      clearStars();
      audio.gameOverSfx();
      audio.vibrate([40, 60, 40]);
      setTimeout(() => callbacks.onGameOver(), 250);
    } else {
      audio.missSfx();
      audio.vibrate([12, 30, 12]);
    }
  }
  // ---------------------------------------------------------------
  // DRAW — everything is drawImage of pre-baked sprites.
  // ---------------------------------------------------------------
  function drawStarSprite(s) {
    const sprite = getStarSprite(s.colorIndex);
    const w = sprite.width;
    const scale = (s.size * 2 + 48) / w; // sprite has 24px glow padding
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.spin * 0.6);
    ctx.scale(
      Math.max(0.15, Math.abs(Math.cos(s.spin))) *
        (Math.cos(s.spin) < 0 ? -1 : 1),
      1,
    );
    ctx.drawImage(
      sprite,
      (-w * scale) / 2,
      (-w * scale) / 2,
      w * scale,
      w * scale,
    );
    ctx.restore();
  }

  function drawScene(t) {
    ctx.clearRect(0, 0, W, H);

    let sx = 0,
      sy = 0;
    if (shake > 0) {
      sx = (Math.random() - 0.5) * shake;
      sy = (Math.random() - 0.5) * shake;
      shake *= 0.86;
      if (shake < 0.4) shake = 0;
    }
    ctx.save();
    ctx.translate(sx, sy);

    background.draw(ctx, W, H, t);

    // ---- Shooting stars + trails (ring buffer, no allocation) ----
    for (let i = 0; i < starCount; i++) {
      const s = stars[i];

      // Push current pos into ring buffer.
      const head = s.trailHead;
      s.trail[head * 3] = s.x;
      s.trail[head * 3 + 1] = s.y;
      s.trail[head * 3 + 2] = s.colorIndex;
      s.trailHead = (head + 1) % TRAIL_LENGTH;
      if (s.trailLen < TRAIL_LENGTH) s.trailLen++;

      // Trail as cheap glow sprites.
      for (let j = 0; j < s.trailLen; j++) {
        const idx = (s.trailHead - 1 - j + TRAIL_LENGTH * 2) % TRAIL_LENGTH;
        const a = 1 - j / s.trailLen;
        const r = (1 + a * s.size * 0.55) * 2;
        ctx.globalAlpha = a * 0.6;
        const glow = getGlowSprite(s.trail[idx * 3 + 2]);
        ctx.drawImage(
          glow,
          s.trail[idx * 3] - r,
          s.trail[idx * 3 + 1] - r,
          r * 2,
          r * 2,
        );
      }
      ctx.globalAlpha = 1;

      s.spin += s.spinSpeed * 0.016 * 60;
      drawStarSprite(s);

      // Move (dt-normalized happens in update; draw uses current pos).
      s.x += s.vx;
      s.y += s.vy;

      if (running && (s.x < -60 || s.x > W + 60 || s.y > H + 60)) {
        handleMiss(i);
        i--;
      }
    }

    // ---- Particles ----
    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];

      if (p.ring) {
        p.r += (p.maxR - p.r) * 0.18;
        ctx.globalAlpha = p.life * 0.6;
        ctx.strokeStyle = STAR_COLORS[p.colorIndex];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
        p.life -= 0.06;
      } else {
        ctx.globalAlpha = Math.max(p.life, 0);
        const sprite = getParticleSprite(p.colorIndex);
        const d = p.size * 2.5;
        if (p.star) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.spin);
          ctx.drawImage(sprite, -d / 2, -d / 2, d, d);
          ctx.restore();
        } else {
          ctx.drawImage(sprite, p.x - d / 2, p.y - d / 2, d, d);
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vy += 0.05;
        p.life -= 0.032;
      }

      if (p.life <= 0) {
        particleCount--;
        const tmp = particles[i];
        particles[i] = particles[particleCount];
        particles[particleCount] = tmp;
        i--;
      }
    }
    ctx.globalAlpha = 1;

    // ---- Flash ----
    if (flashAlpha > 0) {
      ctx.fillStyle = "rgba(255,255,255," + flashAlpha + ")";
      ctx.fillRect(0, 0, W, H);
      flashAlpha *= 0.8;
      if (flashAlpha < 0.01) flashAlpha = 0;
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------
  // LOOP — single requestAnimationFrame, dt-tracked, always alive.
  // ---------------------------------------------------------------
  function loop(t) {
    rafId = requestAnimationFrame(loop);

    const dt = Math.min(50, t - lastT);
    lastT = t;

    // Frozen frame while paused — the React pause overlay dims it.
    if (paused) return;

    if (running) {
      spawnTimer += dt;
      const diff = difficultyFor(game.level);
      if (spawnTimer > diff.spawnInterval) {
        spawnTimer = 0;
        spawnStar();
      }
    }

    drawScene(t);
  }

  // ---------------------------------------------------------------
  // PAUSE / RESUME — freeze the whole sim; canvas keeps its last frame.
  // ---------------------------------------------------------------
  function pause() {
    if (running) paused = true;
  }

  function resume() {
    paused = false;
    lastT = performance.now(); // avoid a giant dt jump after unpausing
  }

  // ---------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------
  function start(level) {
    game.level = Number.isFinite(level) && level >= 1 ? level : loadLevel();
    game.score = 0;
    game.lives = LIVES_MAX;
    game.combo = 0;
    game.bestCombo = 0;
    game.levelHits = 0;
    game.levelTarget = levelTargetFor(game.level); // was levelTargetFor(1)
    starCount = 0;
    particleCount = 0;
    spawnTimer = 0;
    shake = 0;
    flashAlpha = 0;
    paused = false;
    running = true;
    callbacks.onState(game);
    if (!rafId) {
      lastT = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  }

  function nextLevel() {
    game.level++;
    game.levelHits = 0;
    game.levelTarget = levelTargetFor(game.level);
    starCount = 0;
    spawnTimer = 0;
    paused = false;
    running = true;
    callbacks.onState(game);
  }
  function clearStars() {
    for (let i = 0; i < starCount; i++) {
      spawnBurst(stars[i].x, stars[i].y, stars[i].colorIndex, false); // optional: pop them
    }
    starCount = 0;
  }
  function tapAt(x, y) {
    if (!running || paused) return;
    audio.resume();

    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < starCount; i++) {
      const s = stars[i];
      const d = Math.hypot(s.x - x, s.y - y);
      if (d < s.size + 22 && d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    if (best >= 0) handleHit(best);
  }

  function mount() {
    initSprites();
    resize();
    ro.observe(canvas);
    lastT = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function destroy() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    ro.disconnect();
  }
  function resetProgress() {
    saveLevel(1);
    game.level = 1;
  }

  // Explicitly play a chosen level (from the level layer). `start` above
  // falls back to the saved level when called without arguments.
  const startAt = (level) => start(level);
  const getLevel = () => game.level;

  return {
    mount,
    start,
    startAt,
    getLevel,
    nextLevel,
    pause,
    resume,
    tapAt,
    destroy,
    resetProgress,
  };
}
