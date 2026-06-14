export default function ScoreBoard({ players }) {
  return (
    <div className="scoreboard">
      <h3>Scores</h3>

      {players.map((p, i) => (
        <div key={i} className="player">
          {p.username} - {p.score} pts
        </div>
      ))}
    </div>
  );
}