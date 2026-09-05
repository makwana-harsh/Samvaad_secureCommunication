import React from "react";
import defaultGroupAvatar from "../../assets/group_default_profile_pic.png";

const formatTime = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function GroupCard({ conversation, onClick }) {
    const avatarUrl = conversation.avatar || defaultAvatar;

    const senderPrefix = conversation.senderUserName ? `${conversation.senderUserName}: ` : "";

    return (
        
        <div className="chat-card group-card" onClick={onClick}>
            {/* Group Squircle Avatar */}
            <div className="avatar-wrapper group-squircle">
                <img src={avatarUrl} alt={conversation.groupName} className="chat-avatar group-avatar" />
            </div>

            {/* Main Content */}
            <div className="chat-card-info">
                <div className="chat-card-header">
                    <h4 className="chat-groupname">{conversation.groupName}</h4>
                    <span className="chat-timestamp">{formatTime(conversation.lastMessageAt)}</span>
                </div>
                <p className="chat-last-message">
                    {conversation.lastMessage ? `${senderPrefix}${conversation.lastMessage}` : "No messages yet"}
                </p>
            </div>
        </div>
    );
}

export default GroupCard;