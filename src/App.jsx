import { useCallback, useRef, useState } from "react";
import "./App.css";
import GameCanvas from "./components/GameCanvas.jsx";
import Hud from "./components/Hud.jsx";
import {
  HowToOverlay,
  LevelCompleteOverlay,
  GameOverOverlay,
} from "./components/Overlays.jsx";
import { LIVES_MAX } from "./game/config.js";
import FirstPage from "./components/FIrstPage.jsx";
import LevelPage from "./components/LevelPage.jsx";

const INITIAL_HUD = {
  level: 1,
  score: 0,
  lives: LIVES_MAX,
  levelHits: 0,
  levelTarget: 5,
  bestCombo: 0,
};

// Screens:
// - "playing"       in-game (Hud + canvas)
// - "levelPage"     home page: current level, play, change name, how-to
// - "firstpage"     welcome/name page — first-timers only
// - "howto" | "levelComplete" | "gameOver"
//
// Flow: brand-new players (nothing in localStorage) play level 1 directly.
// If they lose on level 1 they land on the welcome page once; from then on
// the level page is the home screen.
function App() {
  const [screen, setScreen] = useState(() =>
    localStorage.getItem("name") ? "levelPage" : "playing",
  );
  // Where the name page sends the player after submitting:
  // "play" for first-timers, "home" when just renaming.
  const [afterName, setAfterName] = useState("play");
  const [hud, setHud] = useState(INITIAL_HUD);
  const [combo, setCombo] = useState(null); // { text, color, key }
  const comboTimer = useRef(null);
  const engineRef = useRef(null);

  // First-time players start the game immediately on mount.
  useEffect(() => {
    if (screen === "playing" && !localStorage.getItem("name")) {
      engineRef.current?.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = () => {
    setHud(INITIAL_HUD);
    setScreen("playing");
    engineRef.current?.start();
  };

  const handleNameSubmit = () => {
    if (afterName === "play") {
      setHud(INITIAL_HUD);
      setScreen("playing");
      engineRef.current?.start();
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

  const handleLevelComplete = useCallback(() => {
    setScreen("levelComplete");
  }, []);

  const handleGameOver = useCallback(() => {
    setScreen("gameOver");
  }, []);

  const handleNextLevel = () => {
    engineRef.current?.nextLevel();
    setScreen("playing");
  };

  const handleRetry = () => {
    setHud(INITIAL_HUD);
    setScreen("playing");
    engineRef.current?.start();
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
          onPlay={handlePlay}
          onChangeName={handleChangeName}
          onHowTo={() => setScreen("howto")}
        />
      )}
      {screen === "firstpage" && (
        <div style={{ position: "relative", zIndex: 9999 }}>
          <FirstPage onSubmit={handleNameSubmit} />
        </div>
      )}
      {screen === "howto" && (
        <HowToOverlay onBack={() => setScreen("levelPage")} />
      )}
      {screen === "levelComplete" && (
        <LevelCompleteOverlay
          score={hud.score}
          bestCombo={hud.bestCombo}
          onNext={handleNextLevel}
        />
      )}
      {screen === "gameOver" && (
        <GameOverOverlay
          score={hud.score}
          level={hud.level}
          bestCombo={hud.bestCombo}
          onRetry={handleRetry}
          onHome={handleHome}
        />
      )}
    </div>
  );
}

export default App;
