import React from "react";
import { FiPhone, FiVideo, FiInfo, FiMoreVertical } from "react-icons/fi";
import defaultAvatar from "../../assets/default_avatar.avif";
import groupAvatar from "../../assets/group_default_profile_pic.png";
import "../../styles/Conversations/ChatHeader.style.css";

export default function ChatHeader({ activeCard }) {
  if (!activeCard) return null;

  const isGroup = activeCard.type === "group";
  const name = isGroup ? activeCard.name : activeCard.targetUser?.userName;
  const avatar = isGroup
    ? activeCard.avatar || groupAvatar
    : activeCard.targetUser?.avatar || defaultAvatar;

  return (
    <header className="chat-header">
      <div className="chat-header-user">
        <div className="chat-header-avatar-wrapper">
          <img src={avatar} alt={name} className="chat-header-avatar" />
          {!isGroup && activeCard.targetUser?.isOnline && (
            <span className="chat-header-online-dot" />
          )}
        </div>
        <div className="chat-header-info">
          <h3 className="chat-header-name">{name || "Chat"}</h3>
          <span className="chat-header-status">
            {isGroup
              ? "Group Conversation"
              : activeCard.targetUser?.isOnline
              ? "Active now"
              : "Offline"}
          </span>
        </div>
      </div>

      {/* <div className="chat-header-actions">
        <button className="chat-action-btn" title="Start Voice Call">
          <FiPhone />
        </button>
        <button className="chat-action-btn" title="Start Video Call">
          <FiVideo />
        </button>
        <button className="chat-action-btn" title="Conversation Info">
          <FiInfo />
        </button>
      </div> */}
    </header>
  );
}