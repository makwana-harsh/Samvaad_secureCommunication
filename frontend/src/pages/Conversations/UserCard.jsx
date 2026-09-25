import React from "react";
import "../../styles/Conversations/UserCard.style.css";
import defaultAvatar from "../../assets/default_avatar.avif";

export default function UserCard({ card, isSelected, onClick }) {
  const { targetUser, lastMessage, lastMessageAt, unreadCount } = card;

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div
      className={`user-card ${isSelected ? "active" : ""}`}
      onClick={() => onClick(card)}
    >
      <div className="user-avatar-wrapper">
        <img
          src={targetUser?.avatar || defaultAvatar}
          alt={targetUser?.userName}
          className="user-card-avatar"
        />
        {targetUser?.isOnline && <span className="user-online-badge" />}
      </div>
      <div className="user-card-info">
        <div className="user-card-header-line">
          <span className="user-card-title">{targetUser?.userName || "Unknown"}</span>
          <span className="user-card-time">{formatTime(lastMessageAt)}</span>
        </div>
        <div className="user-card-sub-line">
          <p className="user-card-last-msg">{lastMessage || "No messages yet"}</p>
          {unreadCount > 0 && <span className="user-unread-badge">{unreadCount}</span>}
        </div>
      </div>
    </div>
  );
}