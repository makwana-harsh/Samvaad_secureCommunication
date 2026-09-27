import React from "react";
import defaultAvatar from "../../assets/default_avatar.avif";
import "../../styles/Discover/UserCard.style.css";

function UserCard({ user, onMessage }) {
    const friendsCount =
        user.friendsCount ?? user.friends?.length ?? 0;

    return (
        <div className="user-row-card">
            <img
                src={user.avatar || defaultAvatar}
                alt={user.userName}
                className="user-row-avatar"
            />

            <div className="user-row-info">
                <div className="user-row-header">
                    <h4 className="user-row-title">@{user.userName}</h4>
                    <span className="badge-user">User</span>
                    {user.relationshipStatus === "friend" && (
                        <span className="badge-friend">✓ Friend</span>
                    )}
                </div>

                {user.fullName && (
                    <p className="user-row-subtitle">{user.fullName}</p>
                )}

                <span className="user-row-meta">
                    {friendsCount} {friendsCount === 1 ? "Friend" : "Friends"}
                </span>
            </div>

            <button
                type="button"
                className="user-message-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onMessage(user);
                }}
            >
                Message
            </button>
        </div>
    );
}

export default UserCard;