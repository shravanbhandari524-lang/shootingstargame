import { useEffect, useRef } from "react";
import { createEngine } from "../game/engine.js";
import { levelCompleteSfx } from "../audio/audio.js";

export default function GameCanvas({
  onReady,
  onState,
  onCombo,
  onLevelComplete,
  onGameOver,
}) {
  const canvasRef = useRef(null);

  // Keep latest callbacks without re-creating the engine.
  const cbsRef = useRef({});
  useEffect(() => {
    cbsRef.current = { onState, onCombo, onLevelComplete, onGameOver };
  });

  useEffect(() => {
    const engine = createEngine(canvasRef.current, {
      onState: (g) => cbsRef.current.onState?.(g),
      onCombo: (text, color) => cbsRef.current.onCombo?.(text, color),
      onLevelComplete: () => {
        levelCompleteSfx();
        cbsRef.current.onLevelComplete?.();
      },
      onGameOver: () => cbsRef.current.onGameOver?.(),
    });

    // Tap handling: pointer events straight on the canvas.
    const onTap = (e) => engine.tapAt(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    canvas.addEventListener("pointerdown", onTap);

    engine.mount();
    onReady?.(engine);

    return () => {
      canvas.removeEventListener("pointerdown", onTap);
      engine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} id="scene" />;
}
