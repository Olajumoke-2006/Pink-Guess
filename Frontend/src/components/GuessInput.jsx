import { useState } from "react";
import { socket } from "../socket/socket";

export default function GuessInput({ roomCode, username, disabled }) {
  const [guess, setGuess] = useState("");

  const sendGuess = () => {
    if (!guess) return;

    socket.emit("guess-answer", {
      roomCode,
      username,
      guess
    });

    setGuess("");
  };

  return (
    <div className="guess-box">
      <input
        value={guess}
        disabled={disabled}
        placeholder="Type your guess..."
        onChange={(e) => setGuess(e.target.value)}
      />

      <button disabled={disabled} onClick={sendGuess}>
        Send
      </button>
    </div>
  );
}