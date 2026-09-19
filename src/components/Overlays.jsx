// All overlay screens. Visibility driven by React props — no DOM classList.

import { useState } from "react";

export function StartOverlay({ onPlay, onHowTo, setScreen }) {
  const [name] = useState(() => localStorage.getItem("name") || "");
  function handleNameChange() {
    localStorage.removeItem("name");
    setScreen("firstpage");
  }

  return (
    <div className="overlay">
      <div className="brand">
        <div className="brand-star">🌠</div>
      </div>
      <h1 className="title">
        SHOOTING
        <br />
        STAR BURST
      </h1>
      <div className="subtitle">
        CATCH THEM BEFORE THEY VANISH
        {name ? (
          <span className="subtitle-name">
            — WELCOME BACK, <b>{name.toUpperCase()}</b>
          </span>
        ) : null}
      </div>
      <div className="btn-stack">
        <button className="btn" onClick={onPlay}>
          PLAY
        </button>
        <button className="btn ghost" onClick={onHowTo}>
          HOW TO PLAY
        </button>
        <button className="btn ghost" onClick={handleNameChange}>
          CHANGE NAME
        </button>
      </div>
    </div>
  );
}

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
            Reach the level target before you run out of lives. Every level
            gets faster!
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

export function GameOverOverlay({
  score,
  level,
  bestCombo,
  onRetry,
  setScreen,
}) {
  function handleGoHome() {
    setScreen("start");
  }
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
      <div className="btn-stack">
        <button className="btn" onClick={onRetry}>
          TRY AGAIN
        </button>
        <button className="btn ghost" onClick={handleGoHome}>
          HOME
        </button>
      </div>
    </div>
  );
}
