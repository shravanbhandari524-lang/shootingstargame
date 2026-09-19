// All overlay screens. Visibility driven by React props — no DOM classList.

export function HowToOverlay({ onBack }) {
  return (
    <div className="overlay">
      <h1 className="title howto-title">
        HOW
        <br />
        TO PLAY
      </h1>
      <div className="howto-steps">
        <div className="howto-step">
          <div className="step-num">1</div>
          <div className="step-text">
            Stars streak across the sky and vanish fast.
          </div>
        </div>
        <div className="howto-step">
          <div className="step-num">2</div>
          <div className="step-text">
            Tap a star to burst it before it escapes.
          </div>
        </div>
        <div className="howto-step">
          <div className="step-num">3</div>
          <div className="step-text">
            Chain hits for combo bonuses &amp; PERFECT hits.
          </div>
        </div>
        <div className="howto-step">
          <div className="step-num">4</div>
          <div className="step-text">
            Reach the level target before you run out of lives. Every level gets
            faster!
          </div>
        </div>
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

export function GameOverOverlay({ score, level, bestCombo, onRetry, onHome }) {
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
