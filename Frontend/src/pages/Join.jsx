import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";

export default function Join() {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const navigate = useNavigate();

  const joinRoom = () => {
    if (!username || !roomCode) return alert("Fill all fields");

    socket.emit("join-room", { username, roomCode });

    navigate("/game", {
      state: { username, roomCode }
    });
  };

  return (
    <div className="join-container">
      <h1 className="title">PINK GUESS</h1>

      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Room Code"
        onChange={(e) => setRoomCode(e.target.value)}
      />

      <button onClick={joinRoom}>
        Join Game
      </button>
    </div>
  );
}