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

  // Keep the latest React callbacks without recreating the game engine.
  const cbsRef = useRef({});

  useEffect(() => {
    cbsRef.current = {
      onState,
      onCombo,
      onLevelComplete,
      onGameOver,
    };
  }, [onState, onCombo, onLevelComplete, onGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const engine = createEngine(canvas, {
      onState: (game) => {
        cbsRef.current.onState?.(game);
      },

      onCombo: (text, color) => {
        cbsRef.current.onCombo?.(text, color);
      },

      onLevelComplete: () => {
        levelCompleteSfx();
        cbsRef.current.onLevelComplete?.();
      },

      onGameOver: () => {
        cbsRef.current.onGameOver?.();
      },
    });

    // -------------------------------------------------------------
    // POINTER INPUT
    // Works with:
    // - mouse
    // - touch
    // - stylus
    // -------------------------------------------------------------
    const onTap = (e) => {
      e.preventDefault();

      engine.tapAt(e.clientX, e.clientY);
    };

    canvas.addEventListener("pointerdown", onTap, {
      passive: false,
    });

    // -------------------------------------------------------------
    // START ENGINE
    // -------------------------------------------------------------
    engine.mount();

    onReady?.(engine);

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    return () => {
      canvas.removeEventListener("pointerdown", onTap);
      engine.destroy();
    };

    // Engine must only be created once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="scene"
      aria-label="Game canvas"
      style={{
        position: "fixed",

        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        width: "100%",
        height: "100%",

        display: "block",

        margin: 0,
        padding: 0,

        touchAction: "none",

        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",

        // Prevent browser rendering quirks.
        maxWidth: "none",
        maxHeight: "none",
      }}
    />
  );
}
