import { useEffect, useState } from "react";

// In-game settings/pause menu. The engine is already paused when this shows.
// RESUME counts down 3-2-1 so the player isn't thrown back in instantly.
export function PauseOverlay({ onResume, onRestart, onHome }) {
  const [count, setCount] = useState(null); // 3, 2, 1 → resume

  // Countdown once RESUME is pressed.
  useEffect(() => {
    if (count == null) return;
    if (count === 0) {
      onResume();
      return;
    }
    const id = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(id);
  }, [count, onResume]);

  return (
    <div className="overlay pause-overlay">
      {count == null ? (
        <>
          <h1 className="title pause-title">PAUSED</h1>
          <div className="subtitle">THE STARS WILL WAIT FOR YOU</div>
          <div className="btn-stack">
            <button className="btn" onClick={() => setCount(3)}>
              RESUME
            </button>
            <button className="btn ghost" onClick={onRestart}>
              RESTART LEVEL
            </button>
            <button className="btn ghost" onClick={onHome}>
              HOME
            </button>
          </div>
        </>
      ) : (
        <div className="pause-count" key={count}>
          {count}
        </div>
      )}
    </div>
  );
}
