import React from "react";
import defaultAvatar from "../../assets/default_avatar.avif";

const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function FriendCard({ conversation, onClick }) {
    const avatarUrl = conversation.avatar || defaultAvatar;

    return (
        <div className="chat-card friend-card" onClick={onClick}>
            {/* Avatar Container with Presence Halo */}
            <div className={`avatar-wrapper circle ${conversation.isOnline ? "online-halo" : ""}`}>
                <img src={avatarUrl} alt={conversation.userName} className="chat-avatar circle-avatar" />
            </div>

            {/* Main Content */}
            <div className="chat-card-info">
                <div className="chat-card-header">
                    <h4 className="chat-username">@{conversation.userName}</h4>
                    <span className="chat-timestamp">{formatTime(conversation.lastMessageAt)}</span>
                </div>
                <p className="chat-last-message">
                    {conversation.lastMessage || "No messages yet"}
                </p>
            </div>
        </div>
    );
}

export default FriendCard;