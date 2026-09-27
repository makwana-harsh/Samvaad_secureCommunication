import React from "react";
import defaultAvatar from "../../assets/group_default_profile_pic.png";
import "../../styles/Discover/GroupCard.style.css";

function GroupCard({ group, onJoin, onMessage, joining }) {
    const memberCount =
        group.membersCount ?? group.members?.length ?? 0;

    return (
        <div className="group-row-card">
            <img
                src={group.avatar || defaultAvatar}
                alt={group.groupName}
                className="group-row-avatar"
            />

            <div className="group-row-info">
                <div className="group-row-header">
                    <h4 className="group-row-title">{group.groupName}</h4>
                    <span className="badge-group">Public</span>
                </div>

                <span className="group-row-meta">
                    {memberCount} {memberCount === 1 ? "Member" : "Members"}
                </span>
            </div>

            {group.isMember ? (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMessage(group);
                    }}
                >
                    Message
                </button>
            ) : (
                <button
                    type="button"
                    disabled={joining}
                    onClick={(e) => {
                        e.stopPropagation();
                        onJoin(group);
                    }}
                >
                    {joining ? "Joining..." : "Join"}
                </button>
            )}
        </div>
    );
}

export default GroupCard;