export default function QuestionBox({ question }) {
  return (
    <div className="question-box">
      <h3>Question:</h3>
      <p>{question || "Waiting for game master..."}</p>
    </div>
  );
}