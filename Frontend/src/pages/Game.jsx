import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../socket/socket";

import ChatBox from "../components/ChatBox";
import QuestionBox from "../components/QuestionBox";
import GuessInput from "../components/GuessInput";
import ScoreBoard from "../components/ScoreBoard";

export default function Game() {
  const { state } = useLocation();

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [timer, setTimer] = useState(60);
  const [players, setPlayers] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    socket.on("players-update", (data) => {
      setPlayers(data);
    });

    socket.on("game-started", (data) => {
      setQuestion(data.question);
      setGameOver(false);
    });

    socket.on("timer", (time) => {
      setTimer(time);
    });

    socket.on("game-over", (data) => {
      setGameOver(true);
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          text: `Game Over! Answer: ${data.answer}`
        }
      ]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="game-container">

      <h2>Room: {state.roomCode}</h2>

      <div className="top-bar">
        <div>⏱ {timer}s</div>
        <div>Players: {players.length}</div>
      </div>

      <QuestionBox question={question} />

      <div className="chat-area">
        <ChatBox messages={messages} />
      </div>

      <GuessInput
        roomCode={state.roomCode}
        username={state.username}
        disabled={gameOver}
      />

      <ScoreBoard players={players} />
    </div>
  );
}