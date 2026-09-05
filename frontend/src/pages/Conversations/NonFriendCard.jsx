import React from "react";
import defaultAvatar from "../../assets/default_avatar.avif";

const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function NonFriendCard({ conversation, onClick }) {
    const avatarUrl = conversation.avatar || defaultAvatar;

    return (
        <div className="chat-card non-friend-card" onClick={onClick}>
            {/* Left Accent Rail */}
            <div className="accent-rail" />

            {/* Squircle Avatar without halo or online status */}
            <div className="avatar-wrapper squircle">
                <img src={avatarUrl} alt={conversation.userName} className="chat-avatar squircle-avatar" />
            </div>

            {/* Main Content */}
            <div className="chat-card-info">
                <div className="chat-card-header">
                    <h4 className="chat-username">@{conversation.userName}</h4>
                    <span className="chat-timestamp">{formatTime(conversation.lastMessageAt)}</span>
                </div>
                <p className="chat-last-message">
                    {conversation.lastMessage || "Temporary conversation"}
                </p>
            </div>
        </div>
    );
}

export default NonFriendCard;