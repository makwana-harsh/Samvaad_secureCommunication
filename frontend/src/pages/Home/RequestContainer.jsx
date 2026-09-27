import React, { useEffect, useState } from "react";
import useSocket from "../../hooks/useSocket";
import {
    getPendingRequestsFunct,
    acceptFriendRequestFunct,
    rejectFriendRequestFunct,
} from "../../api/request.api";
import {
    acceptGroupInvitationFunct,
    rejectGroupInvitationFunct,
} from "../../api/group.api";

import defaultAvatar from "../../assets/default_avatar.avif";
import defaultGroupAvatar from "../../assets/group_default_profile_pic.png";

export default function RequestContainer({ onSelect, onRequestRemoved }) {
    const socket = useSocket();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const res = await getPendingRequestsFunct();
                setRequests(res.data || []);
            } catch (err) {
                console.error("Failed to load requests:", err);
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const addRequest = (request) => {
            setRequests((prev) => {
                const exists = prev.some(
                    (item) =>
                        item.requestId?.toString() ===
                        request.requestId?.toString()
                );

                return exists ? prev : [request, ...prev];
            });
        };

        const removeRequest = ({ requestId }) => {
            setRequests((prev) =>
                prev.filter(
                    (item) =>
                        item.requestId?.toString() !== requestId?.toString()
                )
            );

            onRequestRemoved?.(requestId);
        };

        const handleFriendRequest = (data) => {
            addRequest({
                requestId: data.requestId,
                type: "friend",
                sender: data.sender,
                group: null,
            });
        };

        socket.on("request:received", handleFriendRequest);
        socket.on("request:cancelled", removeRequest);
        socket.on("request:accept_success", removeRequest);
        socket.on("request:reject_success", removeRequest);

        socket.on("group:invitation_received", addRequest);
        socket.on("group:invitation_accept_success", removeRequest);
        socket.on("group:invitation_reject_success", removeRequest);

        return () => {
            socket.off("request:received", handleFriendRequest);
            socket.off("request:cancelled", removeRequest);
            socket.off("request:accept_success", removeRequest);
            socket.off("request:reject_success", removeRequest);

            socket.off("group:invitation_received", addRequest);
            socket.off("group:invitation_accept_success", removeRequest);
            socket.off("group:invitation_reject_success", removeRequest);
        };
    }, [socket, onRequestRemoved]);

    const removeCard = (requestId) => {
        setRequests((prev) =>
            prev.filter(
                (item) =>
                    item.requestId?.toString() !== requestId?.toString()
            )
        );

        onRequestRemoved?.(requestId);
    };

    const acceptRequest = async (request, event) => {
        event.stopPropagation();

        try {
            setActionId(request.requestId);

            if (request.type === "friend") {
                await acceptFriendRequestFunct(request.requestId);
            } else {
                await acceptGroupInvitationFunct(
                    request.group._id,
                    request.requestId
                );
            }

            removeCard(request.requestId);
        } catch (err) {
            console.error(
                "Failed to accept request:",
                err.response?.data || err
            );

        } finally {
            setActionId(null);
        }
    };

    const rejectRequest = async (request, event) => {
        event.stopPropagation();

        try {
            setActionId(request.requestId);

            if (request.type === "friend") {
                await rejectFriendRequestFunct(request.requestId);
            } else {
                await rejectGroupInvitationFunct(
                    request.group._id,
                    request.requestId
                );
            }

            removeCard(request.requestId);
        } catch (err) {
            console.error(
                "Failed to reject request:",
                err.response?.data || err
            );
        } finally {
            setActionId(null);
        }
    };

    if (loading) {
        return <p className="home-request-empty">Loading requests...</p>;
    }

    return (
        <div className="home-request-container">
            <h3>Requests & Invitations</h3>

            {requests.length === 0 && (
                <p className="home-request-empty">
                    No pending requests
                </p>
            )}

            <div className="home-request-list">
                {requests.map((request) => {
                    const isGroup = request.type === "group";
                    const data = isGroup ? request.group : request.sender;
                    const busy =
                        actionId?.toString() === request.requestId?.toString();

                    return (
                        <div
                            className="home-request-card"
                            key={request.requestId}
                            onClick={() => onSelect(request)}
                        >
                            <img
                                src={
                                    data?.avatar ||
                                    (isGroup
                                        ? defaultGroupAvatar
                                        : defaultAvatar)
                                }
                                alt=""
                            />

                            <div className="home-request-info">
                                <strong>
                                    {isGroup
                                        ? data?.groupName
                                        : `@${data?.userName}`}
                                </strong>

                                <small>
                                    {isGroup
                                        ? `Invited by @${request.sender?.userName || "Unknown"}`
                                        : "Sent you a friend request"}
                                </small>
                            </div>

                            <div className="home-request-actions">
                                <button
                                    disabled={busy}
                                    onClick={(e) => acceptRequest(request, e)}
                                >
                                    Accept
                                </button>

                                <button
                                    disabled={busy}
                                    onClick={(e) => rejectRequest(request, e)}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}