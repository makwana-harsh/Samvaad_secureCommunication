import React from "react";
import { Check, MessageCircle, Users } from "lucide-react";
import defaultAvatar from "../../assets/default_avatar.avif";
import "../../styles/Discover/UserCard.style.css";

const STATUS = {
    friend: { label: "Friend", cls: "friend" },
    pending_sent: { label: "Request sent", cls: "pending" },
    pending_received: { label: "Wants to connect", cls: "pending" },
};

function UserCard({ user, onMessage }) {
    const friendsCount = user.friendsCount ?? user.friends?.length ?? 0;
    const isFriend = user.relationshipStatus === "friend";
    const status = STATUS[user.relationshipStatus];

    return (
        <div className={`uc ${isFriend ? "uc-friend" : ""}`}>
            <div className="uc-avatar">
                <img src={user.avatar || defaultAvatar} alt={user.userName} />
                {isFriend && (
                    <span className="uc-check"><Check size={11} strokeWidth={3.5} /></span>
                )}
            </div>

            <div className="uc-body">
                <div className="uc-title">
                    <h4>@{user.userName}</h4>
                    {status && <span className={`chip chip-${status.cls}`}>{status.label}</span>}
                </div>

                {user.fullName && <p className="uc-name">{user.fullName}</p>}

                <span className="uc-meta">
                    <Users size={13} /> {friendsCount} {friendsCount === 1 ? "friend" : "friends"}
                </span>
            </div>

            <button
                type="button"
                className={`pill-btn ${isFriend ? "" : "pill-btn--ghost"}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onMessage(user);
                }}
            >
                <MessageCircle size={15} /> <span className="uc-btn-label">Message</span>
            </button>
        </div>
    );
}

export default UserCard;
