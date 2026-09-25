import React from "react";
import "../../styles/Conversations/MessageBubble.style.css";

export default function MessageBubble({ message, isOwn }) {
  const isSystem = message.messageType === "system" || !message.senderId;

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isSystem) {
    return (
      <div className="message-system-row">
        <span className="system-message-pill">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`message-row ${isOwn ? "own" : "other"}`}>
      <div className="message-bubble">
        {!isOwn && message.senderUserName && (
          <span className="message-sender">{message.senderUserName}</span>
        )}
        <p className="message-text">{message.content}</p>
        <span className="message-time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}