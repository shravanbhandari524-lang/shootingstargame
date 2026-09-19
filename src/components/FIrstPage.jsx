import { useState } from "react";

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
    <div>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleSubmit}>Welcome</button>
    </div>
  );
}
