import { useState } from "react";

export default function FirstPage({ setScreen }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem("name", trimmed);
    setScreen("start");
  };

  return (
    <div className="overlay first-page">
      <div className="brand">
        <div className="brand-star">🌠</div>
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
