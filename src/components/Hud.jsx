import { LIVES_MAX } from "../game/config.js";

function LifeStar({ filled }) {
  return (
    <div className={`life-star ${filled ? "active" : ""}`}>
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path
          d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6z"
          fill={filled ? "#ffd76b" : "rgba(255,255,255,0.15)"}
          stroke={filled ? "#ffec99" : "rgba(255,255,255,0.2)"}
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}

export default function Hud({
  visible,
  level,
  score,
  lives,
  levelHits,
  levelTarget,
  onPause,
}) {
  return (
    <div className="hud" style={{ display: visible ? "" : "none" }}>
      <div className="hud-left">
        {onPause && (
          <button
            className="hud-pill pause-btn-pill"
            onClick={onPause}
            aria-label="Pause game"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        )}
        <div className="hud-pill lives">
          {Array.from({ length: LIVES_MAX }, (_, i) => (
            <LifeStar key={i} filled={i < lives} />
          ))}
        </div>
      </div>

      <div className="hud-pill mid-box">
        <div className="level-label">LVL {level}</div>
        <div className="progress-wrap">
          <div
            className="progress-bar"
            style={{ width: Math.min(100, (levelHits / levelTarget) * 100) + "%" }}
          />
        </div>
        <div className="progress-txt">
          {levelHits} / {levelTarget}
        </div>
      </div>

      <div className="hud-pill score-box">
        <div className="score-label">SCORE</div>
        <div className="score-val">{score}</div>
      </div>
    </div>
  );
}
