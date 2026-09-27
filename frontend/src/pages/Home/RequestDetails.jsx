import React from "react";
import defaultAvatar from "../../assets/default_avatar.avif";
import defaultGroupAvatar from "../../assets/group_default_profile_pic.png";

export default function RequestDetails({ request, onClose }) {
    if (!request) return null;

    const isGroup = request.type === "group";
    const data = isGroup ? request.group : request.sender;

    return (
        <div className="request-details-overlay" onClick={onClose}>
            <div
                className="request-details"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="request-details-close"
                    onClick={onClose}
                >
                    ✕
                </button>

                <div className="request-details-profile">
                    <img
                        src={
                            data?.avatar ||
                            (isGroup ? defaultGroupAvatar : defaultAvatar)
                        }
                        alt=""
                    />

                    <h2>
                        {isGroup
                            ? data?.groupName
                            : `@${data?.userName || ""}`}
                    </h2>

                    {!isGroup && data?.fullName && (
                        <p>{data.fullName}</p>
                    )}

                    <p>{data?.bio || "No bio"}</p>
                </div>

                {isGroup && (
                    <>
                        <div className="request-group-info">
                            <p>
                                <strong>Admin:</strong>{" "}
                                @{data?.adminId?.userName || "Unknown"}
                            </p>

                            <p>
                                <strong>Members:</strong>{" "}
                                {data?.members?.length || 0}
                            </p>

                            <p>
                                <strong>Visibility:</strong>{" "}
                                {data?.visibility || "N/A"}
                            </p>
                        </div>

                        <h3>Group Members</h3>

                        <div className="request-member-list">
                            {data?.members?.map((member) => (
                                <div
                                    className="request-member"
                                    key={member._id}
                                >
                                    <img
                                        src={member.avatar || defaultAvatar}
                                        alt=""
                                    />

                                    <span>
                                        @{member.userName || "Unknown"}
                                    </span>

                                    {member._id?.toString() ===
                                        data.adminId?._id?.toString() && (
                                        <small>Admin</small>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}