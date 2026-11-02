import React from "react";
import { Check, Globe, MessageCircle, Plus, Users } from "lucide-react";
import defaultAvatar from "../../assets/group_default_profile_pic.png";
import "../../styles/Discover/GroupCard.style.css";

function GroupCard({ group, onJoin, onMessage, joining }) {
    const memberCount = group.membersCount ?? group.members?.length ?? 0;

    return (
        <div className="gc">
            <div className="gc-avatar">
                <img src={group.avatar || defaultAvatar} alt={group.groupName} />
            </div>

            <div className="gc-body">
                <div className="gc-title">
                    <h4>{group.groupName}</h4>
                    <span className="chip chip-public"><Globe size={11} /> Public</span>
                </div>

                {group.bio && <p className="gc-bio">{group.bio}</p>}

                <span className="gc-meta">
                    <Users size={13} /> {memberCount} {memberCount === 1 ? "member" : "members"}
                    {group.isMember && (
                        <span className="chip chip-joined"><Check size={11} strokeWidth={3} /> Joined</span>
                    )}
                </span>
            </div>

            {group.isMember ? (
                <button
                    type="button"
                    className="pill-btn pill-btn--ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMessage(group);
                    }}
                >
                    <MessageCircle size={15} /> <span className="uc-btn-label">Message</span>
                </button>
            ) : (
                <button
                    type="button"
                    className="pill-btn"
                    disabled={joining}
                    onClick={(e) => {
                        e.stopPropagation();
                        onJoin(group);
                    }}
                >
                    {joining ? <span className="spinner gc-spin" /> : <Plus size={15} strokeWidth={2.6} />}
                    <span className="uc-btn-label">{joining ? "Joining" : "Join"}</span>
                </button>
            )}
        </div>
    );
}

export default GroupCard;
