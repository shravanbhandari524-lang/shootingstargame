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

  return (
    <div className="overlay">
      <div className="brand">
        <GameLogo className="brand-logo" />
      </div>
      <div className="lp-name">HI, {name.toUpperCase()}</div>
      <h1 className="title">
        LEVEL
        <br />
        {current}
      </h1>
      <div className="lp-progress">
        {completedCount} / {LEVELS_COUNT} COMPLETED
      </div>
      <div className="btn-stack">
        <button className="btn" onClick={() => onPlay(current)}>
          PLAY
        </button>
        <button className="btn ghost" onClick={onLevels}>
          LEVELS
        </button>
        <button className="btn ghost" onClick={onHowTo}>
          HOW TO PLAY
        </button>
        <button className="btn ghost" onClick={onChangeName}>
          CHANGE NAME
        </button>
      </div>
    </div>
  );
}
