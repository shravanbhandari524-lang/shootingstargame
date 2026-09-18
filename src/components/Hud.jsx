import { LIVES_MAX } from "../game/config.js";

function LifeStar({ filled }) {
  return (
    <div className="life-star">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path
          d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6z"
          fill={filled ? "#ffd76b" : "rgba(255,255,255,0.12)"}
          stroke={filled ? "#c99a2e" : "transparent"}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export default function Hud({ visible, level, score, lives, levelHits, levelTarget }) {
  return (
    <div className="hud" style={{ display: visible ? "" : "none" }}>
      <div className="lives">
        {Array.from({ length: LIVES_MAX }, (_, i) => (
          <LifeStar key={i} filled={i < lives} />
        ))}
      </div>

      <div className="mid-box">
        <div className="level-label">LEVEL {level}</div>
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

      <div className="score-box">
        <div className="score-label">SCORE</div>
        <div className="score-val">{score}</div>
      </div>
    </div>
  );
}
