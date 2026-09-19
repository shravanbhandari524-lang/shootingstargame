// Central game configuration — tweak all balance here.

export const STAR_COLORS = ["#ffd76b", "#6bf3ff", "#ff6bcf", "#b98bff", "#6bffb0"];

export const LIVES_MAX = 3;
export const TRAIL_LENGTH = 18;

export const START_LEVEL = 1;
export const LEVEL_TARGET_BASE = 5;
export const LEVEL_TARGET_STEP = 2;

// Number of levels offered on the level layer. Bump to add more;
// difficultyFor/levelTargetFor already scale with the level number.
export const LEVELS_COUNT = 20;

// Pre-computed color variants used for sprite baking & gradients.
export const STAR_COLORS_RGB = STAR_COLORS.map((c) => hexToRgb(c));

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function levelTargetFor(lv) {
  return LEVEL_TARGET_BASE + (lv - START_LEVEL) * LEVEL_TARGET_STEP;
}

export function difficultyFor(lv) {
  return {
    spawnInterval: Math.max(360, 900 - (lv - 1) * 60),
    speed: Math.min(9, 3.2 + (lv - 1) * 0.5),
    maxAlive: Math.min(3, 1 + Math.floor((lv - 1) / 2)),
    size: Math.max(20, 30 - (lv - 1) * 1.2),
  };
}
