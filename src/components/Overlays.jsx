export function HowToOverlay({ onBack }) {
  return (
    <div className="overlay">
      <div className="glass-card">
        <h1 className="title howto-title">HOW TO PLAY</h1>
        <div className="howto-steps">
          <div className="howto-step">
            <div className="step-num">1</div>
            <div className="step-text">
              Stars streak across the night sky and vanish quickly.
            </div>
          </div>
          <div className="howto-step">
            <div className="step-num">2</div>
            <div className="step-text">
              Tap a star to burst it before it escapes off screen.
            </div>
          </div>
          <div className="howto-step">
            <div className="step-num">3</div>
            <div className="step-text">
              Chain consecutive hits for multiplier &amp; PERFECT combo bonuses.
            </div>
          </div>
          <div className="howto-step">
            <div className="step-num">4</div>
            <div className="step-text">
              Reach the star target before losing all 3 lives. Each level gets faster!
            </div>
          </div>
        </div>
        <button className="btn" onClick={onBack}>
          GOT IT! 🚀
        </button>
      </div>
    </div>
  );
}

export function LevelCompleteOverlay({
  score,
  bestCombo,
  onNext,
  onContinue,
  continueLevel,
  level,
  onHome,
}) {
  return (
    <div className="overlay">
      <div className="glass-card">
        <h1 className="lc-title">LEVEL COMPLETE!</h1>
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
          NEXT LEVEL ⚡
        </button>
        <div className="btn-stack">
          {continueLevel != null && continueLevel !== level + 1 && (
            <button className="btn ghost" onClick={onContinue}>
              CONTINUE · LEVEL {continueLevel}
            </button>
          )}
          <button className="btn ghost" onClick={onHome}>
            HOME PAGE 🏠
          </button>
        </div>
      </div>
    </div>
  );
}

export function GameOverOverlay({
  score,
  level,
  bestCombo,
  onRetry,
  onContinue,
  continueLevel,
  onHome,
}) {
  return (
    <div className="overlay">
      <div className="glass-card">
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
          TRY AGAIN 🔄
        </button>
        <div className="btn-stack">
          {continueLevel != null && continueLevel !== level && (
            <button className="btn ghost" onClick={onContinue}>
              CONTINUE · LEVEL {continueLevel}
            </button>
          )}
          <button className="btn ghost" onClick={onHome}>
            HOME PAGE 🏠
          </button>
        </div>
      </div>
    </div>
  );
}
