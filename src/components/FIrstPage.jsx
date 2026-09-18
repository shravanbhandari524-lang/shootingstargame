import { useState } from "react";

export default function FirstPage({ setScreen }) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;

    localStorage.setItem("name", name.trim());
    setScreen("start");
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
