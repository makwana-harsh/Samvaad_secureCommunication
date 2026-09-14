import React, { useEffect, useRef, useState } from "react";
import useSocket from "../../hooks/useSocket";
import { getUserProfileFunct, unfriendUserFunct } from "../../api/user.api";
import { sendFriendRequestFunct, cancelFriendRequestFunct, acceptFriendRequestFunct, rejectFriendRequestFunct } from "../../api/request.api";
import "../../styles/Discover/DetailViewModal.style.css";
import defaultAvatar from "../../assets/default_avatar.avif";
import group_default_profile_pic from "../../assets/group_default_profile_pic.png";

function DetailViewModal({ data: initialData, type, onClose, onDataUpdate }) {
    const socket = useSocket();
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(type === "user");
    const [enlargedImage, setEnlargedImage] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const dataRef = useRef(initialData);

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    useEffect(() => {
        setData(initialData);
        dataRef.current = initialData;
    }, [initialData]);

    useEffect(() => {
        let isMounted = true;

        const fetchFullProfile = async () => {
            if (type !== "user" || !initialData?._id) {
                setData(initialData);
                dataRef.current = initialData;
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await getUserProfileFunct(initialData._id);
                const fullProfile = res?.data || res;

                if (!isMounted || !fullProfile) return;

                const updated = {
                    ...initialData,
                    ...fullProfile,
                    relationshipStatus: fullProfile.relationshipStatus || initialData.relationshipStatus || "none",
                };

                dataRef.current = updated;
                setData(updated);
                onDataUpdate?.(updated);
            } catch (err) {
                if (isMounted) {
                    const updated = {
                        ...initialData,
                        relationshipStatus: initialData.relationshipStatus || "none",
                    };

                    dataRef.current = updated;
                    setData(updated);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchFullProfile();

        return () => {
            isMounted = false;
        };
    }, [initialData?._id, type]);

    useEffect(() => {
        if (!socket || type !== "user" || !initialData?._id) return;

        const targetUserId = initialData._id.toString();

        const applyUpdate = (updates, notifyParent = true) => {
            if (!updates) return;

            const updated = { ...dataRef.current, ...updates };
            dataRef.current = updated;
            setData(updated);

            if (notifyParent) onDataUpdate?.(updated);
        };

        const handleRequestReceived = (eventData) => {
            if (eventData?.sender?._id?.toString() !== targetUserId) return;

            applyUpdate({
                relationshipStatus: "pending_received",
                activeRequestId: eventData.requestId,
            });
        };

        const handleRequestSentSuccess = (eventData) => {
            if (eventData?.receiverId?.toString() !== targetUserId) return;

            applyUpdate({
                relationshipStatus: "pending_sent",
                activeRequestId: eventData.requestId,
            });
        };

        const handleRequestCancelled = (eventData) => {
            if (eventData?.senderId?.toString() !== targetUserId) return;

            applyUpdate({
                relationshipStatus: "none",
                activeRequestId: null,
            });
        };

        const handleCancelSuccess = (eventData) => {
            if (eventData?.receiverId?.toString() !== targetUserId) return;

            applyUpdate({
                relationshipStatus: "none",
                activeRequestId: null,
            });
        };

        const handleRequestAccepted = (eventData) => {
            const acceptedBy = eventData?.acceptedBy;

            if (acceptedBy?._id?.toString() !== targetUserId) return;

            applyUpdate({
                ...acceptedBy,
                relationshipStatus: "friend",
                activeRequestId: null,
                friendsCount: acceptedBy.friendsCount ?? acceptedBy.friends?.length ?? dataRef.current.friendsCount ?? 0,
            });
        };

        const handleAcceptSuccess = (eventData) => {
            const newFriend = eventData?.newFriend;

            if (newFriend?._id?.toString() !== targetUserId) return;

            applyUpdate({
                ...newFriend,
                relationshipStatus: "friend",
                activeRequestId: null,
                friendsCount: newFriend.friendsCount ?? newFriend.friends?.length ?? dataRef.current.friendsCount ?? 0,
            });
        };

        const handleRequestRejected = (eventData) => {
            if (eventData?.rejectedBy?.toString() !== targetUserId) return;

            applyUpdate({
                relationshipStatus: "none",
                activeRequestId: null,
            });
        };

        const handleRejectSuccess = (eventData) => {
            if (eventData?.senderId?.toString() !== targetUserId) return;

            applyUpdate({
                relationshipStatus: "none",
                activeRequestId: null,
            });
        };

        const handleUserUnfriended = (eventData) => {
            if (eventData?.unfriendedBy?.toString() !== targetUserId) return;

            applyUpdate(eventData.profile);
        };

        const handleUnfriendSuccess = (eventData) => {
            if (eventData?.targetUserId?.toString() !== targetUserId) return;

            applyUpdate(eventData.profile);
        };

        socket.on("request:received", handleRequestReceived);
        socket.on("request:sent_success", handleRequestSentSuccess);
        socket.on("request:cancelled", handleRequestCancelled);
        socket.on("request:cancel_success", handleCancelSuccess);
        socket.on("request:accepted", handleRequestAccepted);
        socket.on("request:accept_success", handleAcceptSuccess);
        socket.on("request:rejected", handleRequestRejected);
        socket.on("request:reject_success", handleRejectSuccess);
        socket.on("user:unfriended", handleUserUnfriended);
        socket.on("user:unfriend_success", handleUnfriendSuccess);

        return () => {
            socket.off("request:received", handleRequestReceived);
            socket.off("request:sent_success", handleRequestSentSuccess);
            socket.off("request:cancelled", handleRequestCancelled);
            socket.off("request:cancel_success", handleCancelSuccess);
            socket.off("request:accepted", handleRequestAccepted);
            socket.off("request:accept_success", handleAcceptSuccess);
            socket.off("request:rejected", handleRequestRejected);
            socket.off("request:reject_success", handleRejectSuccess);
            socket.off("user:unfriended", handleUserUnfriended);
            socket.off("user:unfriend_success", handleUnfriendSuccess);
        };
    }, [socket, type, initialData?._id, onDataUpdate]);

    if (!data) return null;

    const updateData = (updates, notifyParent = true) => {
        const updated = { ...dataRef.current, ...updates };
        dataRef.current = updated;
        setData(updated);

        if (notifyParent) onDataUpdate?.(updated);
    };

    const handleSendRequest = async () => {
        if (!data?._id || actionLoading) return;

        try {
            setActionLoading(true);

            const res = await sendFriendRequestFunct(data._id);
            const reqData = res?.data || res;

            updateData({
                relationshipStatus: reqData?.relationshipStatus || "pending_sent",
                activeRequestId: reqData?._id || reqData?.requestId || data.activeRequestId || null,
            });
        } catch (err) {
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!data.activeRequestId || actionLoading) return;

        try {
            setActionLoading(true);
            await cancelFriendRequestFunct(data.activeRequestId);

            updateData({
                relationshipStatus: "none",
                activeRequestId: null,
            });
        } catch (err) {
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        if (!data.activeRequestId || actionLoading) return;

        try {
            setActionLoading(true);

            await acceptFriendRequestFunct(data.activeRequestId);

            const updatedProfile = await getUserProfileFunct(data._id);
            const fullData = updatedProfile?.data || updatedProfile;

            updateData({
                ...(fullData || {}),
                relationshipStatus: "friend",
                activeRequestId: null,
            });
        } catch (err) {
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!data.activeRequestId || actionLoading) return;

        try {
            setActionLoading(true);
            await rejectFriendRequestFunct(data.activeRequestId);

            updateData({
                relationshipStatus: "none",
                activeRequestId: null,
            });
        } catch (err) {
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnfriend = async () => {
        if (!data?._id || actionLoading) return;

        try {
            setActionLoading(true);
            await unfriendUserFunct(data._id);
        } catch (err) {
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const openImageModal = (src) => {
        if (src) setEnlargedImage(src);
    };

    const closeImageModal = () => setEnlargedImage(null);

    return (
        <div className="fullscreen-overlay">
            <div className="fullscreen-header">
                <h2>{type === "user" ? "User Profile" : "Group Details"}</h2>
                <button className="close-btn" onClick={onClose}>✕ Close</button>
            </div>

            <div className="fullscreen-content">
                <div className="details-header-card">
                    <img
                        src={data.avatar || (type === "user" ? defaultAvatar : group_default_profile_pic)}
                        alt="Profile Avatar"
                        className="details-avatar clickable-avatar"
                        onClick={() => openImageModal(data.avatar || (type === "user" ? defaultAvatar : group_default_profile_pic))}
                    />

                    <h3>{type === "user" ? `@${data.userName || ""}` : data.groupName || ""}</h3>

                    {data.fullName && <p className="details-fullname">{data.fullName}</p>}
                    {data.bio && <p className="details-bio">"{data.bio}"</p>}

                    {type === "user" && data.relationshipStatus !== "self" && (
                        <div className="modal-action-bar">
                            {loading ? (
                                <span className="action-loading-text">Loading actions...</span>
                            ) : (
                                <>
                                    {(data.relationshipStatus === "none" || data.relationshipStatus === undefined) && (
                                        <button className="btn-action-primary" onClick={handleSendRequest} disabled={actionLoading}>
                                            {actionLoading ? "Sending..." : "Add Friend"}
                                        </button>
                                    )}

                                    {data.relationshipStatus === "pending_sent" && (
                                        <div className="action-btn-group">
                                            <span className="action-status-badge status-badge-pending">Request Sent</span>
                                            <button className="btn-action-secondary" onClick={handleCancelRequest} disabled={actionLoading}>
                                                {actionLoading ? "Canceling..." : "Cancel Request"}
                                            </button>
                                        </div>
                                    )}

                                    {data.relationshipStatus === "pending_received" && (
                                        <div className="action-btn-group">
                                            <button className="btn-action-success" onClick={handleAcceptRequest} disabled={actionLoading}>
                                                {actionLoading ? "Accepting..." : "Accept Request"}
                                            </button>
                                            <button className="btn-action-secondary" onClick={handleRejectRequest} disabled={actionLoading}>
                                                {actionLoading ? "Rejecting..." : "Reject"}
                                            </button>
                                        </div>
                                    )}

                                    {data.relationshipStatus === "friend" && (
                                        <div className="action-btn-group">
                                            <span className="action-status-badge status-badge-friend">✓ Friends</span>
                                            <button className="btn-action-secondary" onClick={handleUnfriend} disabled={actionLoading}>
                                                {actionLoading ? "Unfriending..." : "Unfriend"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {type === "user" ? (
                    <div className="details-sections">
                        <div className="info-grid">
                            <div className="info-item"><strong>Email:</strong> {data.emailId || "N/A"}</div>
                            <div className="info-item"><strong>DOB:</strong> {formatDate(data.dob)}</div>
                            <div className="info-item"><strong>Friends Count:</strong> {data.friendsCount ?? data.friends?.length ?? 0}</div>
                            <div className="info-item"><strong>Public Groups Joined:</strong> {data.publicGroups?.length || 0}</div>

                            {(data.relationshipStatus === "friend" || data.relationshipStatus === "self") && (
                                <>
                                    <div className="info-item"><strong>Mobile:</strong> {data.mobileNo || "N/A"}</div>
                                    <div className="info-item"><strong>Location:</strong> {data.location || "N/A"}</div>
                                    <div className="info-item"><strong>Private Groups Joined:</strong> {data.privateGroups?.length || 0}</div>
                                </>
                            )}
                        </div>

                        {data.publicGroups?.length > 0 && (
                            <div className="list-section">
                                <h4>Joined Public Groups</h4>
                                <div className="chip-container">
                                    {data.publicGroups.map((groupName, idx) => (
                                        <span key={idx} className="simple-chip">{groupName}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.privateGroups?.length > 0 && (data.relationshipStatus === "friend" || data.relationshipStatus === "self") && (
                            <div className="list-section">
                                <h4>Joined Private Groups</h4>
                                <div className="chip-container">
                                    {data.privateGroups.map((groupName, idx) => (
                                        <span key={idx} className="simple-chip private">{groupName}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.friends?.length > 0 && (
                            <div className="list-section">
                                <h4>Friends</h4>
                                <div className="user-cards-grid">
                                    {data.friends.map((friend, index) => {
                                        const friendData = typeof friend === "object"
                                            ? friend
                                            : { _id: friend, userName: "Unknown" };

                                        return (
                                            <div key={friendData._id?.toString() || index} className="mini-user-card">
                                                <img
                                                    src={friendData.avatar || defaultAvatar}
                                                    alt={friendData.userName || "Friend"}
                                                    className="mini-avatar clickable-avatar"
                                                    onClick={() => openImageModal(friendData.avatar || defaultAvatar)}
                                                />

                                                <span className="mini-username">
                                                    @{friendData.userName || "Unknown"}
                                                </span>

                                                <button
                                                    className="copy-btn"
                                                    onClick={() => copyToClipboard(friendData.userName || "", friendData._id)}
                                                >
                                                    {copiedId === friendData._id ? "Copied!" : "Copy"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="details-sections">
                        <div className="info-grid">
                            <div className="info-item"><strong>Admin:</strong> @{data.admin?.userName || "Unknown"}</div>
                            <div className="info-item"><strong>Total Members:</strong> {data.members?.length || 0}</div>
                            <div className="info-item"><strong>Visibility:</strong> {data.visibility || "N/A"}</div>
                            <div className="info-item"><strong>Created At:</strong> {data.createdAt ? new Date(data.createdAt).toLocaleString() : "N/A"}</div>
                        </div>

                        {data.members?.length > 0 && (
                            <div className="list-section">
                                <h4>Group Members</h4>
                                <div className="user-cards-grid">
                                    {data.members.map((member, index) => (
                                        <div key={member?._id?.toString() || index} className="mini-user-card">
                                            <img
                                                src={member?.avatar || defaultAvatar}
                                                alt={member?.userName || "Member"}
                                                className="mini-avatar clickable-avatar"
                                                onClick={() => openImageModal(member?.avatar || defaultAvatar)}
                                            />

                                            <span className="mini-username">
                                                @{member?.userName || "Unknown"}
                                            </span>

                                            <button
                                                className="copy-btn"
                                                onClick={() => copyToClipboard(member?.userName || "", member?._id)}
                                            >
                                                {copiedId === member?._id ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {enlargedImage && (
                <div className="lightbox-overlay" onClick={closeImageModal}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={enlargedImage}
                            alt="Enlarged profile"
                            className="lightbox-image"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DetailViewModal;