import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import useSocket from "../../hooks/useSocket";
import useDebounce from "../../hooks/useDebounce";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import {getConversationsApi, openPrivateConversationApi, getMessagesApi, sendMessageApi, sendAttachmentApi} from "../../api/conversation.api";

import CreateGroup from "./CreateGroup";
import ChatInfo from "./ChatInfo";
import defaultAvatar_forGroup from "../../assets/group_default_profile_pic.png";
import defaultAvatar from "../../assets/default_avatar.avif";
import "../../styles/Conversations/ConversationPage.style.css";

import MessageImage from "../../components/MessageImage.jsx";

import { downloadAttachmentApi } from "../../api/conversation.api";

export default function ConversationPage() {
    const socket = useSocket();
    const [showChatInfo, setShowChatInfo] = useState(false);

    const location = useLocation();
    const openedFromHomeRef = useRef(false);

    const [showCreateGroup, setShowCreateGroup] = useState(false);

    const [tab, setTab] = useState("friends");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const [cards, setCards] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const selectedRef = useRef(null);
    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const tabRef = useRef(tab);

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const group = location.state?.openGroup;

        if (!group?.conversationId) return;

        const openGroup = async () => {
            setTab("friends");

            const card = {
                cardId: `group-${group.groupId}`,
                conversationId: group.conversationId,
                type: "group",
                groupId: group.groupId,
                groupName: group.groupName,
                avatar: group.avatar,
            };

            await selectCard(card);
        };

        openGroup();
    }, [location.state?.openGroup]);

    useEffect(() => {
        tabRef.current = tab;
    }, [tab]);

    useEffect(() => {
        selectedRef.current = selected;
    }, [selected]);

    const handleDownloadAttachment = async (message) => {
        try {
            await downloadAttachmentApi(message);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    const handleAttachment = async (e) => {
        const file = e.target.files?.[0];

        if (!file || !selected?.conversationId || uploading) return;

        try {
            setUploading(true);
            setUploadProgress(0);

            await sendAttachmentApi(
                selected.conversationId,
                file,
                (event) => {
                    if (!event.total) return;

                    setUploadProgress(
                        Math.round((event.loaded * 100) / event.total)
                    );
                }
            );
        } catch (err) {
            console.error("Attachment upload failed:", err);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            e.target.value = "";
        }
    };

    const loadCards = useCallback(async (pageNum, reset = false) => {
        const requestedTab = tab;

        try {
            loadingRef.current = true;
            setLoading(true);

            const res = await getConversationsApi(
                requestedTab,
                debouncedSearch,
                pageNum,
                15
            );

            // Ignore response if user switched tabs while request was running
            if (tabRef.current !== requestedTab) return;

            if (res.success) {
                setCards((prev) =>
                    reset ? res.data : [...prev, ...res.data]
                );

                setHasMore(res.pagination.hasMore);
                setPage(pageNum);
                pageRef.current = pageNum;
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (tabRef.current === requestedTab) {
                loadingRef.current = false;
                setLoading(false);
            }
        }
    }, [tab, debouncedSearch]);

    useEffect(() => {
        setCards([]);
        setPage(1);
        pageRef.current = 1;
        loadCards(1, true);
    }, [loadCards]);

    const loadMore = useCallback(() => {
        if (!loadingRef.current && hasMore) loadCards(pageRef.current + 1);
    }, [hasMore, loadCards]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    const selectCard = async (card) => {
        setShowChatInfo(false);
        try {
            let conversationId = card.conversationId;

            if (!conversationId && card.type === "friend") {
                const res = await openPrivateConversationApi(card.userId);
                conversationId = res.data.conversationId;
            }

            if (!conversationId) return;

            const updated = { ...card, conversationId };
            setSelected(updated);
            selectedRef.current = updated;

            const res = await getMessagesApi(conversationId);
            setMessages(res.success ? res.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const userId = location.state?.openUserId;

        if (!userId || openedFromHomeRef.current) return;

        openedFromHomeRef.current = true;

        const openFriend = async () => {
            try {
                setTab(
                    location.state?.conversationTab === "temporary"
                        ? "temporary"
                        : "friends"
                );

                const res = await openPrivateConversationApi(userId);

                if (!res.success) return;

                const user = res.data.targetUser;

                const card = {
                    cardId: `user-${user._id}`,
                    conversationId: res.data.conversationId,
                    type: "friend",
                    userId: user._id,
                    userName: user.userName,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen,
                };

                await selectCard(card);
            } catch (err) {
                console.error("Failed to open friend conversation:", err);
            }
        };

        openFriend();
    }, [location.state]);

    const sendMessage = async (e) => {
        e.preventDefault();

        const content = text.trim();
        if (!content || !selected?.conversationId) return;

        try {
            setText("");
            await sendMessageApi(selected.conversationId, content);
        } catch (err) {
            console.error(err);
            setText(content);
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleOnline = ({ userId }) => {
            setCards((prev) => prev.map((card) =>
                card.userId?.toString() === userId?.toString()
                    ? { ...card, isOnline: true }
                    : card
            ));

            setSelected((prev) =>
                prev?.userId?.toString() === userId?.toString()
                    ? { ...prev, isOnline: true }
                    : prev
            );
        };

        const handleOffline = ({ userId, lastSeen }) => {
            setCards((prev) => prev.map((card) =>
                card.userId?.toString() === userId?.toString()
                    ? { ...card, isOnline: false, lastSeen }
                    : card
            ));

            setSelected((prev) =>
                prev?.userId?.toString() === userId?.toString()
                    ? { ...prev, isOnline: false, lastSeen }
                    : prev
            );
        };

        const handleMessage = ({ message, conversationUpdate }) => {
            const conversationId = conversationUpdate?.conversationId?.toString();

            if (selectedRef.current?.conversationId?.toString() === conversationId) {
                setMessages((prev) => {
                    if (prev.some((m) => m._id?.toString() === message._id?.toString())) return prev;
                    return [...prev, message];
                });
            }

            setCards((prev) => {
                const index = prev.findIndex(
                    (card) => card.conversationId?.toString() === conversationId
                );

                if (index === -1) return prev;

                const card = {
                    ...prev[index],
                    lastMessage: conversationUpdate.lastMessage,
                    lastMessageAt: conversationUpdate.lastMessageAt,
                    senderUserName:
                        message.senderId?._id?.toString() === socket.userId?.toString()
                            ? "You"
                            : conversationUpdate.senderUserName,
                };

                return [card, ...prev.filter((_, i) => i !== index)];
            });
        };

        const handleGroupCreated = (card) => {
            if (tab !== "friends") return;

            setCards((prev) => {
                if (prev.some((item) => item.cardId === card.cardId)) return prev;
                return [card, ...prev];
            });
        };

        const handleGroupUpdated = (data) => {
            setCards((prev) => prev.map((card) =>
                card.groupId?.toString() === data.groupId?.toString()
                    ? { ...card, bio: data.bio, avatar: data.avatar }
                    : card
            ));

            setSelected((prev) =>
                prev?.groupId?.toString() === data.groupId?.toString()
                    ? { ...prev, bio: data.bio, avatar: data.avatar }
                    : prev
            );
        };

        const handleGroupRemoved = ({ groupId }) => {
            setCards((prev) =>
                prev.filter((card) => card.groupId?.toString() !== groupId?.toString())
            );

            if (selectedRef.current?.groupId?.toString() === groupId?.toString()) {
                setSelected(null);
                setMessages([]);
                setShowChatInfo(false);
            }
        };

        socket.on("group:updated", handleGroupUpdated);
        socket.on("group:removed", handleGroupRemoved);

        socket.on("group:created", handleGroupCreated);

        socket.on("user:online", handleOnline);
        socket.on("user:offline", handleOffline);
        socket.on("message:new", handleMessage);

        return () => {
            socket.off("group:updated", handleGroupUpdated);
            socket.off("group:removed", handleGroupRemoved);
            socket.off("group:created", handleGroupCreated);
            socket.off("user:online", handleOnline);
            socket.off("user:offline", handleOffline);
            socket.off("message:new", handleMessage);
        };
    }, [socket]);

    const formatTime = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="conversation-page">

            {showCreateGroup && (
                <CreateGroup
                    onClose={() => setShowCreateGroup(false)}
                    onCreated={(card) => {
                        setCards((prev) => {
                            if (prev.some((item) => item.cardId === card.cardId)) {
                                return prev;
                            }

                            return [card, ...prev];
                        });

                        setShowCreateGroup(false);
                    }}
                />
            )}

            <aside className="conversation-sidebar">
                <input
                    className="conversation-search"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="conversation-tabs">
                    <button className={tab === "friends" ? "active" : ""} onClick={() => setTab("friends")}>
                        Friends & Groups
                    </button>

                    <button className={tab === "temporary" ? "active" : ""} onClick={() => setTab("temporary")}>
                        Temporary Chats
                    </button>
                </div>

                {tab === "friends" && (
                    <button
                        className="create-group-btn"
                        onClick={() => setShowCreateGroup(true)}
                    >
                        + Create Group
                    </button>
                )}

                <div className="conversation-list">
                    {cards.map((card) => (
                        <div
                            key={card.cardId}
                            className={`conversation-card ${selected?.cardId === card.cardId ? "selected" : ""}`}
                            onClick={() => selectCard(card)}
                        >
                            
                            <img
                                src={card.avatar || (card.type === "group" ? defaultAvatar_forGroup : defaultAvatar)}
                                alt=""
                            />

                            <div className="conversation-card-info">
                                <strong>
                                    {card.type === "group" ? card.groupName : `@${card.userName}`}
                                </strong>

                                <small>
                                    {card.type !== "group" && (
                                        <span className={card.isOnline ? "online" : ""}>
                                            {card.isOnline ? "● " : ""}
                                        </span>
                                    )}

                                    {card.lastMessage
                                        ? `${card.senderUserName ? `${card.senderUserName}: ` : ""}${card.lastMessage}`
                                        : "No messages"}
                                </small>
                            </div>

                            <span className="conversation-time">
                                {formatTime(card.lastMessageAt)}
                            </span>
                        </div>
                    ))}

                    {!loading && cards.length === 0 && (
                        <p className="empty-message">No conversations found</p>
                    )}

                    <div ref={sentinelRef} />
                    {loading && <p className="empty-message">Loading...</p>}
                </div>
            </aside>

            <main className="chat-panel">

                

                {selected && showChatInfo ? (
                    <ChatInfo
                        selected={selected}
                        onClose={() => setShowChatInfo(false)}
                        onGroupLeft={(groupId) => {
                            setCards((prev) =>
                                prev.filter((card) => card.groupId !== groupId)
                            );
                            setSelected(null);
                            setMessages([]);
                            setShowChatInfo(false);
                        }}
                    />
                ) : !selected ? (
                    <div className="chat-empty">Select a conversation</div>
                ) : (
                    <>
                        <header
                            className="chat-header clickable"
                            onClick={() => setShowChatInfo(true)}
                        >
                            <img
                                src={selected.avatar || (
                                    selected.type === "group"
                                        ? defaultAvatar_forGroup
                                        : defaultAvatar
                                )}
                                alt=""
                            />

                            <div>
                                <strong>
                                    {selected.type === "group"
                                        ? selected.groupName
                                        : `@${selected.userName}`}
                                </strong>

                                {selected.type !== "group" && (
                                    <small>
                                        {selected.isOnline ? "Online" : "Offline"}
                                    </small>
                                )}
                            </div>
                        </header>

                        <section className="messages-container">
                            {messages.map((message) => (
                                <div
                                    className={`message ${message.messageType === "system" ? "system-message" : ""}`}
                                    key={message._id}
                                >
                                    {message.messageType !== "system" && (
                                        <strong>@{message.senderId?.userName || "Unknown"}</strong>
                                    )}

                                    {message.messageType === "text" && (
                                        <span>{message.content}</span>
                                    )}

                                    {message.messageType === "image" && (
                                        <MessageImage message={message} />
                                    )}

                                    {message.messageType === "video" && (
                                        <div className="message-media">
                                            <video
                                                className="message-video"
                                                controls
                                                preload="metadata"
                                                poster={message.thumbnailUrl || undefined}
                                            >
                                                <source src={message.content} type={message.mimeType} />
                                            </video>

                                            <button
                                                type="button"
                                                onClick={() => handleDownloadAttachment(message)}
                                            >
                                                ⬇ Download
                                            </button>
                                        </div>
                                    )}

                                    {message.messageType === "audio" && (
                                        <div className="message-media">
                                            <audio controls preload="metadata">
                                                <source src={message.content} type={message.mimeType} />
                                            </audio>

                                            <button
                                                type="button"
                                                onClick={() => handleDownloadAttachment(message)}
                                            >
                                                ⬇ Download
                                            </button>
                                        </div>
                                    )}

                                    {message.messageType === "file" && (
                                        <div className="message-file">
                                            <span>
                                                📎 {message.originalFileName || "File"}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => handleDownloadAttachment(message)}
                                            >
                                                ⬇ Download
                                            </button>
                                        </div>
                                    )}

                                    {message.messageType === "system" && (
                                        <span>{message.content}</span>
                                    )}
                                    <small>{formatTime(message.createdAt)}</small>
                                </div>
                            ))}

                            {messages.length === 0 && (
                                <div className="chat-empty">No messages yet</div>
                            )}
                        </section>

                        <form className="message-input" onSubmit={sendMessage}>

                            <input
                                ref={fileInputRef}
                                type="file"
                                hidden
                                onChange={handleAttachment}
                            />

                            <button
                                type="button"
                                disabled={uploading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                📎
                            </button>

                            {uploading && (
                                <span>{uploadProgress}%</span>
                            )}

                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button type="submit">Send</button>
                        </form>
                    </>
                )}
            </main>
        </div>
    );
}