// Home page shown after first launch: current level, play, rename, how-to.
// Replaces the old StartOverlay (welcome text only makes sense on first play).

export default function LevelPage({ onPlay, onChangeName, onHowTo }) {
  const name = localStorage.getItem("name") || "PLAYER";
  const level = Math.max(1, parseInt(localStorage.getItem("currentlevel"), 10) || 1);

  return (
    <div className="overlay">
      <div className="brand">
        <div className="brand-star">🌠</div>
      </div>
      <div className="lp-name">HI, {name.toUpperCase()}</div>
      <h1 className="title">
        LEVEL
        <br />
        {level}
      </h1>
      <div className="subtitle">CATCH THEM BEFORE THEY VANISH</div>
      <button className="btn" onClick={onPlay}>
        PLAY
      </button>
      <button className="btn ghost" onClick={onHowTo}>
        HOW TO PLAY
      </button>
      <button className="btn ghost" onClick={onChangeName}>
        change name
      </button>
    </div>
  );
}
