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
  const current = Math.min(Math.max(1, maxlevel), LEVELS_COUNT);
  const completedCount = current - 1;
  const pct = Math.round((completedCount / LEVELS_COUNT) * 100);

  return (
    <div className="overlay home-page">
      <div className="glass-card">
        <div className="brand">
          <GameLogo className="brand-logo home-logo" />
        </div>
        <div className="lp-name">WELCOME, {name.toUpperCase()}</div>
        <h1 className="title">
          LEVEL {current}
        </h1>
        <div className="lp-progress">
          {completedCount} / {LEVELS_COUNT} COMPLETED ({pct}%)
        </div>
        <button className="btn" onClick={() => onPlay(current)}>
          PLAY NOW 🚀
        </button>
        <div className="btn-stack">
          <button className="btn ghost" onClick={onLevels}>
            ALL LEVELS 🎯
          </button>
          <button className="btn ghost" onClick={onHowTo}>
            HOW TO PLAY 📖
          </button>
          <button className="btn ghost" onClick={onChangeName}>
            CHANGE NAME ✏️
          </button>
        </div>
      </div>
    </div>
  );
}
