import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import GameCanvas from "./components/GameCanvas.jsx";
import Hud from "./components/Hud.jsx";
import {
  HowToOverlay,
  LevelCompleteOverlay,
  GameOverOverlay,
} from "./components/Overlays.jsx";
import { LIVES_MAX, START_LEVEL } from "./game/config.js";
import FirstPage from "./components/FIrstPage.jsx";
import LevelPage from "./components/LevelPage.jsx";
import LevelLayer from "./components/LevelLayer.jsx";
import { PauseOverlay } from "./components/PauseOverlay.jsx";

const INITIAL_HUD = {
  level: START_LEVEL,
  score: 0,
  lives: LIVES_MAX,
  levelHits: 0,
  levelTarget: 5,
  bestCombo: 0,
};

const LEVEL_KEY = "currentlevel";
const MAXLEVEL_KEY = "maxlevel";

function readLevel(key) {
  try {
    const n = parseInt(localStorage.getItem(key), 10);
    return Number.isFinite(n) && n >= 1 ? n : START_LEVEL;
  } catch {
    return START_LEVEL;
  }
}

// SECURITY: progress is the MAX ever reached. Replaying an older level can
// never write a lower value, so picking level 1 again can't reset you to 1.
function saveMaxLevel(level) {
  try {
    const prev = readLevel(MAXLEVEL_KEY);
    if (level > prev) {
      localStorage.setItem(MAXLEVEL_KEY, String(level));
      localStorage.setItem(LEVEL_KEY, String(level));
    }
  } catch {
    // storage blocked — progress just won't persist
  }
}

// Screens:
// - "playing"       in-game (Hud + canvas)
// - "levelPage"     home page: name, level overview, play
// - "levelLayer"    full list of levels (opened from home page)
// - "firstpage"     welcome/name page — first-timers only
// - "howto" | "levelComplete" | "gameOver"
//
// Flow:
// - Brand-new players (nothing in localStorage) see the welcome page once,
//   then play straight away. Losing for the first time lands them on the
//   home page, which now also lists every level in the layer.
// - Completing a level offers NEXT LEVEL or "go to home page".
function App() {
  const [screen, setScreen] = useState(() =>
    localStorage.getItem("name") ? "levelPage" : "playing",
  );
  // Where the name page sends the player after submitting:
  // "play" for first-timers, "home" when just renaming.
  const [afterName, setAfterName] = useState("play");
  const [hud, setHud] = useState(INITIAL_HUD);
  // Exact level the player is in (TRY AGAIN must restart this same level,
  // even if it's an older one they picked from the level layer).
  const playedLevelRef = useRef(START_LEVEL);
  const [combo, setCombo] = useState(null); // { text, color, key }
  const [paused, setPaused] = useState(false);
  const comboTimer = useRef(null);
  const engineRef = useRef(null);

  // First-time players start the game immediately on mount.
  useEffect(() => {
    if (screen === "playing" && !localStorage.getItem("name")) {
      engineRef.current?.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = (level) => {
    setHud(INITIAL_HUD);
    setScreen("playing");
    // Called with no arg from PLAY → use saved level; with a number → that level.
    if (typeof level === "number") {
      playedLevelRef.current = level;
      engineRef.current?.startAt(level);
    } else {
      engineRef.current?.start();
      playedLevelRef.current = engineRef.current?.getLevel?.() ?? START_LEVEL;
    }
  };

  const handleNameSubmit = () => {
    if (afterName === "play") {
      setHud(INITIAL_HUD);
      setScreen("playing");
      engineRef.current?.start();
      playedLevelRef.current = engineRef.current?.getLevel?.() ?? START_LEVEL;
    } else {
      setScreen("levelPage");
    }
  };

  const handleState = useCallback((g) => {
    // Engine mutates `g` in place; shallow-copy so React sees a change.
    setHud({
      level: g.level,
      score: g.score,
      lives: g.lives,
      levelHits: g.levelHits,
      levelTarget: g.levelTarget,
      bestCombo: g.bestCombo,
    });
  }, []);

  const handleCombo = useCallback((text, color) => {
    setCombo({ text, color, key: Date.now() });
    clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => setCombo(null), 550);
  }, []);

  // Pause via the in-game settings button. Engine freezes; the frozen
  // canvas stays visible behind the dimmed pause overlay.
  const handlePause = () => {
    engineRef.current?.pause();
    setPaused(true);
  };

  const handleResume = useCallback(() => {
    setPaused(false);
    engineRef.current?.resume();
  }, []);

  // RESTART LEVEL from the pause menu: rerun the level being played.
  const handlePauseRestart = () => {
    setPaused(false);
    const lv = playedLevelRef.current;
    setHud(INITIAL_HUD);
    engineRef.current?.startAt(lv);
  };

  const handlePauseHome = () => {
    setPaused(false);
    handleHome();
  };

  const handleLevelComplete = () => {
    // Persist progress with the max-guard (never lower than before).
    const engine = engineRef.current;
    if (engine?.getLevel) saveMaxLevel(engine.getLevel() + 1);
    setScreen("levelComplete");
  };

  const handleGameOver = () => {
    setScreen("gameOver");
  };

  const handleNextLevel = () => {
    engineRef.current?.nextLevel();
    playedLevelRef.current = engineRef.current?.getLevel?.() ?? START_LEVEL;
    setScreen("playing");
  };

  // Offered after completing an older level: jump back to the normal
  // progression level instead of stepping up from the replayed one.
  const handleContinueFromComplete = () => {
    const lv = Math.max(readLevel(MAXLEVEL_KEY), readLevel(LEVEL_KEY));
    setHud(INITIAL_HUD);
    setScreen("playing");
    playedLevelRef.current = lv;
    engineRef.current?.startAt(lv);
  };

  // TRY AGAIN restarts the exact level that was just lost — never the saved
  // "next" level.
  const handleRetry = () => {
    const lv = playedLevelRef.current;
    setHud(INITIAL_HUD);
    setScreen("playing");
    engineRef.current?.startAt(lv);
  };

  // Offered when the lost level was an older one: jump back to the normal
  // progression level.
  const handleContinueNext = () => {
    const lv = Math.max(readLevel(MAXLEVEL_KEY), readLevel(LEVEL_KEY));
    setHud(INITIAL_HUD);
    setScreen("playing");
    playedLevelRef.current = lv;
    engineRef.current?.startAt(lv);
  };

  const handleChangeName = () => {
    setAfterName("home");
    localStorage.removeItem("name");
    setScreen("firstpage");
  };

  // "Home" after a loss: first-timers (who played before naming themselves)
  // see the welcome page once; everyone else goes to the level page.
  const handleHome = () => {
    if (localStorage.getItem("name")) {
      setScreen("levelPage");
    } else {
      setAfterName("play");
      setScreen("firstpage");
    }
  };

  return (
    <div id="stage">
      <GameCanvas
        onReady={(engine) => (engineRef.current = engine)}
        onState={handleState}
        onCombo={handleCombo}
        onLevelComplete={handleLevelComplete}
        onGameOver={handleGameOver}
      />
      <Hud visible={screen === "playing"} {...hud} />
      {screen === "playing" && !paused && (
        <button
          className="pause-btn"
          onClick={handlePause}
          aria-label="Pause game"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              fill="currentColor"
              d="M8 5h3v14H8zM13 5h3v14h-3z"
            />
          </svg>
        </button>
      )}
      {paused && (
        <PauseOverlay
          onResume={handleResume}
          onRestart={handlePauseRestart}
          onHome={handlePauseHome}
        />
      )}
      {combo && (
        <div
          key={combo.key}
          className="combo-msg show"
          style={{ color: combo.color, textShadow: `0 0 24px ${combo.color}` }}
        >
          {combo.text}
        </div>
      )}
      {screen === "levelPage" && (
        <LevelPage
          maxlevel={Math.max(readLevel(MAXLEVEL_KEY), readLevel(LEVEL_KEY))}
          onPlay={handlePlay}
          onChangeName={handleChangeName}
          onHowTo={() => setScreen("howto")}
          onLevels={() => setScreen("levelLayer")}
        />
      )}
      {screen === "levelLayer" && (
        <LevelLayer
          // Old saves only had "currentlevel" — treat it as the floor for
          // maxlevel so upgrading never shrinks anyone's progress.
          maxlevel={Math.max(readLevel(MAXLEVEL_KEY), readLevel(LEVEL_KEY))}
          onSelect={handlePlay}
          onClose={() => setScreen("levelPage")}
        />
      )}
      {screen === "firstpage" && <FirstPage onSubmit={handleNameSubmit} />}
      {screen === "howto" && (
        <HowToOverlay onBack={() => setScreen("levelPage")} />
      )}
      {screen === "levelComplete" && (
        <LevelCompleteOverlay
          score={hud.score}
          bestCombo={hud.bestCombo}
          level={hud.level}
          onNext={handleNextLevel}
          onContinue={handleContinueFromComplete}
          continueLevel={Math.max(
            readLevel(MAXLEVEL_KEY),
            readLevel(LEVEL_KEY),
          )}
          onHome={handleHome}
        />
      )}
      {screen === "gameOver" && (
        <GameOverOverlay
          score={hud.score}
          level={hud.level}
          bestCombo={hud.bestCombo}
          onRetry={handleRetry}
          onContinue={handleContinueNext}
          continueLevel={Math.max(
            readLevel(MAXLEVEL_KEY),
            readLevel(LEVEL_KEY),
          )}
          onHome={handleHome}
        />
      )}
    </div>
  );
}

export default App;
