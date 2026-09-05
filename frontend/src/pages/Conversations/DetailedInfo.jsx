import React from "react";
import "../../styles/DetailedInfo.style.css";

function DetailedInfo({ conversation, onClose }) {
  if (!conversation) return null;

  const isGroup = conversation.type === "group";
  const name = isGroup
    ? conversation.groupName
    : conversation.fullName || conversation.userName;

  return (
    <div className="detailed-info-overlay">
      <div className="detailed-info-modal">
        <div className="info-header">
          <h3>{isGroup ? "Group Info" : "User Info"}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="info-body">
          <img
            src={conversation.avatar || "/default_avatar.avif"}
            alt={name}
            className="info-avatar"
          />
          <h4 className="info-name">{name}</h4>
          {!isGroup && <p className="info-username">@{conversation.userName}</p>}

          <div className="info-section">
            <h5>Details</h5>
            <div className="info-row">
              <span>Type</span>
              <span>{isGroup ? "Group Chat" : "Direct Message"}</span>
            </div>
            {conversation.messageRetentionDays && (
              <div className="info-row">
                <span>Disappearing Messages</span>
                <span>{conversation.messageRetentionDays} days</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailedInfo;