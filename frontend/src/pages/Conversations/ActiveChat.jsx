import React, { useState, useEffect } from "react";
import ImageModal from "./ImageModal";
import DetailedInfo from "./DetailedInfo";
import "../../styles/ActiveChat.style.css";

function ActiveChat({ conversation }) {
  // 1. Guard check FIRST to render empty state safely when null
  if (!conversation) {
    return (
      <div className="chat-box-empty">
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  return <ActiveChatContent conversation={conversation} />;
}

// Inner component guarantees 'conversation' is non-null
function ActiveChatContent({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);

  // Synchronize initial messages when conversation changes
  useEffect(() => {
    setMessages([
      {
        _id: "m1",
        senderId: conversation.otherUserId || "them",
        text: conversation.lastMessage || "Hey! How are you?",
        createdAt: conversation.lastMessageAt || new Date().toISOString(),
      },
    ]);
  }, [conversation._id, conversation.conversationId]);

  const displayName =
    conversation.type === "group"
      ? conversation.groupName
      : conversation.fullName || conversation.userName;
  const avatarUrl = conversation.avatar || "/default_avatar.avif";

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        senderId: "me",
        text,
        createdAt: new Date().toISOString(),
      },
    ]);
    setText("");
  };

  return (
    <div className="chat-box-container">
      {/* HEADER */}
      <div className="chat-header">
        <div
          className="header-avatar-container"
          onClick={() => setSelectedImage(avatarUrl)}
        >
          <img src={avatarUrl} alt={displayName} className="header-avatar" />
        </div>

        <div
          className="header-details-clickable"
          onClick={() => setShowDetailedInfo(true)}
        >
          <div className="header-title">{displayName}</div>
          <div className="header-subtitle">
            {conversation.type === "group"
              ? "Click for Group Info"
              : conversation.isOnline
              ? "Online"
              : "Click for User Info"}
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION - MESSAGES LIST */}
      <div className="messages-area scrollable">
        {messages.map((msg) => {
          const isMe = msg.senderId === "me";
          return (
            <div
              key={msg._id}
              className={`message-wrapper ${isMe ? "me" : "them"}`}
            >
              <div className="message-bubble">{msg.text}</div>
            </div>
          );
        })}
      </div>

      {/* FOOTER SECTION - INPUT & ATTACHMENTS */}
      <form className="chat-footer" onSubmit={handleSend}>
        <label htmlFor="file-upload" className="attachment-btn">
          📎
          <input id="file-upload" type="file" style={{ display: "none" }} />
        </label>

        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button type="submit" disabled={!text.trim()}>
          Send
        </button>
      </form>

      {/* AVATAR LIGHTBOX */}
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt={displayName}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* DETAILED INFO DRAWER */}
      {showDetailedInfo && (
        <DetailedInfo
          conversation={conversation}
          onClose={() => setShowDetailedInfo(false)}
        />
      )}
    </div>
  );
}

export default ActiveChat;