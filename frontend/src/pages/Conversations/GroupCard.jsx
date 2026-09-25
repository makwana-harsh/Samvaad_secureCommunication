import React from "react";
import groupAvatar from "../../assets/group_default_profile_pic.png";
import "../../styles/Conversations/GroupCard.style.css";

export default function GroupCard({ card, isSelected, onClick }) {
  const { name, avatar, lastMessage, senderUserName, lastMessageAt, unreadCount } = card;

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
      className={`group-card ${isSelected ? "active" : ""}`}
      onClick={() => onClick(card)}
    >
      <div className="group-avatar-wrapper">
        <img src={avatar || groupAvatar} alt={name} className="group-card-avatar" />
      </div>
      <div className="group-card-info">
        <div className="group-card-header-line">
          <span className="group-card-title">{name}</span>
          <span className="group-card-time">{formatTime(lastMessageAt)}</span>
        </div>
        <div className="group-card-sub-line">
          <p className="group-card-last-msg">
            {lastMessage
              ? `${senderUserName ? `${senderUserName}: ` : ""}${lastMessage}`
              : "No messages yet"}
          </p>
          {unreadCount > 0 && <span className="group-unread-badge">{unreadCount}</span>}
        </div>
      </div>
    </div>
  );
}