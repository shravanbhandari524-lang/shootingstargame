// All overlay screens. Visibility driven by React props — no DOM classList.

export function HowToOverlay({ onBack }) {
  return (
    <div className="overlay">
      <h1 className="title" style={{ fontSize: "9.5vw" }}>
        HOW TO PLAY
      </h1>
      <div
        style={{
          maxWidth: "320px",
          color: "var(--cream)",
          fontSize: "16px",
          lineHeight: "1.65",
          margin: "18px 0",
          fontWeight: 600,
        }}
      >
        Stars streak across the sky and vanish fast.
        <br />
        <br />
        Tap a star to burst it before it escapes. Chain hits for combo bonuses.
        <br />
        <br />
        Hit the level's target count before you run out of misses. Every level
        gets faster.
      </div>
      <button className="btn" onClick={onBack}>
        GOT IT
      </button>
    </div>
  );
}

export function LevelCompleteOverlay({ score, bestCombo, onNext }) {
  return (
    <div className="overlay">
      <h1 className="lc-title">
        LEVEL
        <br />
        COMPLETE
      </h1>
      <div className="stat-row">
        <div className="stat">
          <div className="n">{score}</div>
          <div className="l">SCORE</div>
        </div>
        <div className="stat">
          <div className="n">{bestCombo}</div>
          <div className="l">BEST COMBO</div>
        </div>
      </div>
      <button className="btn" onClick={onNext}>
        NEXT LEVEL
      </button>
    </div>
  );
}

export function GameOverOverlay({
  score,
  level,
  bestCombo,
  onRetry,
  onHome,
}) {
  return (
    <div className="overlay">
      <h1 className="go-title">SKY WENT DARK</h1>
      <div className="stat-row">
        <div className="stat">
          <div className="n">{score}</div>
          <div className="l">SCORE</div>
        </div>
        <div className="stat">
          <div className="n">{level}</div>
          <div className="l">LEVEL</div>
        </div>
        <div className="stat">
          <div className="n">{bestCombo}</div>
          <div className="l">BEST COMBO</div>
        </div>
      </div>
      <button className="btn" onClick={onRetry}>
        TRY AGAIN
      </button>
      <button className="btn ghost" onClick={onHome}>
        go to home page
      </button>
    </div>
  );
}
