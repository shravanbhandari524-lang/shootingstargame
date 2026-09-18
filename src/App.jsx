import { useCallback, useRef, useState } from "react";
import "./App.css";
import GameCanvas from "./components/GameCanvas.jsx";
import Hud from "./components/Hud.jsx";
import {
  StartOverlay,
  HowToOverlay,
  LevelCompleteOverlay,
  GameOverOverlay,
} from "./components/Overlays.jsx";
import { LIVES_MAX } from "./game/config.js";

const INITIAL_HUD = {
  level: 1,
  score: 0,
  lives: LIVES_MAX,
  levelHits: 0,
  levelTarget: 5,
  bestCombo: 0,
};

function App() {
  const [screen, setScreen] = useState("start"); // start | howto | playing | levelComplete | gameOver
  const [hud, setHud] = useState(INITIAL_HUD);
  const [combo, setCombo] = useState(null); // { text, color, key }
  const comboTimer = useRef(null);
  const engineRef = useRef(null);

  const handlePlay = () => {
    setHud(INITIAL_HUD);
    setScreen("playing");
    engineRef.current?.start();
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

      {screen === "start" && <StartOverlay onPlay={handlePlay} onHowTo={() => setScreen("howto")} />}
      {screen === "howto" && <HowToOverlay onBack={() => setScreen("start")} />}
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
        />
      )}
    </div>
  );
}

export default App;
