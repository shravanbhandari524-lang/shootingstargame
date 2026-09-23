import { useState } from "react";
import GameLogo from "./GameLogo.jsx";

// Welcome/name page. Where it sends the player after submitting is decided
// by App (first-timers go straight into the game, renames go home).
export default function FirstPage({ onSubmit }) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;

    localStorage.setItem("name", name.trim());
    onSubmit?.();
  };

  return (
    <div className="overlay first-page">
      <div className="brand">
        <GameLogo className="brand-logo" />
      </div>
      <h1 className="title first-title">
        SHOOTING
        <br />
        STAR BURST
      </h1>
      <div className="subtitle">WHAT SHOULD THE SKY CALL YOU?</div>

      <form className="name-form" onSubmit={handleSubmit}>
        <input
          className="name-input"
          type="text"
          placeholder="Your name"
          maxLength={14}
          autoComplete="off"
          spellCheck={false}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="btn"
          type="submit"
          disabled={!name.trim()}
          aria-label="Start your journey"
        >
          LAUNCH 🚀
        </button>
      </form>
    </div>
  );
}
