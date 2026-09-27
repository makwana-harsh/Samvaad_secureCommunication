import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSocket from "../../hooks/useSocket";
import { getOnlineFriendsApi } from "../../api/conversation.api";
import defaultAvatar from "../../assets/default_avatar.avif";

export default function OnlineFriendsContainer() {
    const socket = useSocket();
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getOnlineFriendsApi();
                setFriends(res.data || []);
            } catch (err) {
                console.error("Failed to load online friends:", err);
            }
        };

        load();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleOnline = async ({ userId }) => {
            try {
                const res = await getOnlineFriendsApi();
                setFriends(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        const handleOffline = ({ userId }) => {
            setFriends((prev) =>
                prev.filter(
                    (friend) =>
                        friend._id?.toString() !== userId?.toString()
                )
            );
        };

        socket.on("user:online", handleOnline);
        socket.on("user:offline", handleOffline);

        return () => {
            socket.off("user:online", handleOnline);
            socket.off("user:offline", handleOffline);
        };
    }, [socket]);

    const openConversation = (friend) => {
        navigate("/conversations", {
            state: { openUserId: friend._id },
        });
    };

    return (
        <div className="online-friends-container">
            <h3>Online Friends</h3>

            {friends.length === 0 ? (
                <p className="online-friends-empty">
                    No friends online
                </p>
            ) : (
                <div className="online-friends-list">
                    {friends.map((friend) => (
                        <div
                            key={friend._id}
                            className="online-friend-card"
                            onClick={() => openConversation(friend)}
                        >
                            <div className="online-friend-avatar">
                                <img
                                    src={friend.avatar || defaultAvatar}
                                    alt=""
                                />
                                <span className="online-status-dot" />
                            </div>

                            <strong>@{friend.userName}</strong>

                            <small>Online</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}