import { LEVELS_COUNT } from "../game/config.js";

export default function LevelLayer({ maxlevel, onSelect, onClose }) {
  const levels = Array.from({ length: LEVELS_COUNT }, (_, i) => i + 1);

  return (
    <div className="overlay level-layer">
      <div className="glass-card">
        <h1 className="title layer-title">LEVELS</h1>
        <div className="subtitle">SELECT A LEVEL TO PLAY</div>

        <div className="level-grid">
          {levels.map((lv) => {
            const completed = lv <= maxlevel - 1; // beaten
            const unlocked = lv <= maxlevel; // reachable now (incl. ghost next)
            const ghost = unlocked && !completed; // next up unlocked

            return (
              <button
                key={lv}
                className={
                  "lv-cell" +
                  (completed ? " done" : "") +
                  (ghost ? " ghost" : "") +
                  (!unlocked ? " locked" : "")
                }
                disabled={!unlocked}
                onClick={() => onSelect(lv)}
                aria-label={
                  completed
                    ? `Replay level ${lv}`
                    : ghost
                      ? `Play level ${lv}`
                      : `Level ${lv} locked`
                }
              >
                <span className="lv-num">{lv}</span>
                <span className="lv-tag">
                  {completed ? "✓" : ghost ? "PLAY" : "🔒"}
                </span>
              </button>
            );
          })}
        </div>

        <button className="btn ghost" onClick={onClose}>
          BACK
        </button>
      </div>
    </div>
  );
}
