export default function ChatBox({ messages }) {
  return (
    <div className="chat-box">
      {messages.map((msg, i) => (
        <div key={i} className={msg.system ? "system" : "message"}>
          {msg.text}
        </div>
      ))}
    </div>
  );
}