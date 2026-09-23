// Home page: player name, level overview, play, all-levels layer, rename.
import { LEVELS_COUNT } from "../game/config.js";
import GameLogo from "./GameLogo.jsx";

export default function LevelPage({
  onPlay,
  onChangeName,
  onHowTo,
  onLevels,
  maxlevel = 1,
}) {
  const name = localStorage.getItem("name") || "PLAYER";
  // Highest level the player has unlocked (beaten maxlevel-1, so maxlevel
  // itself is the "next up" level — shown dimmed/ghost until completed).
  const current = Math.min(Math.max(1, maxlevel), LEVELS_COUNT);
  const completedCount = current - 1;
  const pct = Math.round((completedCount / LEVELS_COUNT) * 100);

  return (
    <div className="overlay home-page">
      <GameLogo className="brand-logo home-logo" />
      <div className="lp-name">HI, {name.toUpperCase()}</div>

      <div className="home-level-card">
        <div className="home-level-label">CURRENT LEVEL</div>
        <div className="home-level-num">{current}</div>
        <div className="home-track">
          <div className="home-fill" style={{ width: pct + "%" }} />
        </div>
        <div className="lp-progress">
          {completedCount} / {LEVELS_COUNT} COMPLETED
        </div>
      </div>

      <div className="btn-stack">
        <button className="btn" onClick={() => onPlay(current)}>
          PLAY
        </button>
        <div className="home-row">
          <button className="btn ghost home-half" onClick={onLevels}>
            LEVELS
          </button>
          <button className="btn ghost home-half" onClick={onHowTo}>
            HOW TO PLAY
          </button>
        </div>
      </div>

      <button className="link-btn" onClick={onChangeName}>
        Change name
      </button>
    </div>
  );
}
