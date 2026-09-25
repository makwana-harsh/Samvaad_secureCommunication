import React, { useState } from "react";
import { FiPaperclip, FiSmile, FiSend } from "react-icons/fi";
import "../../styles/Conversations/MessageInput.style.css";

export default function MessageInput({ onSendMessage, disabled }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText("");
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        className="chat-input-field"
      />
      <div className="message-input-actions">
        <button type="button" className="input-action-btn" title="Attach file">
          <FiPaperclip />
        </button>
        <button type="button" className="input-action-btn" title="Add emoji">
          <FiSmile />
        </button>
        <button
          type="submit"
          className="send-message-btn"
          disabled={!text.trim() || disabled}
        >
          <FiSend /> Send
        </button>
      </div>
    </form>
  );
}