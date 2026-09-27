import React, { useCallback, useEffect, useRef, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import {createGroupFunct,searchGroupUsersFunct,} from "../../api/group.api";
import defaultAvatar from "../../assets/default_avatar.avif";

export default function CreateGroup({ onClose, onCreated }) {
    const [groupName, setGroupName] = useState("");
    const [bio, setBio] = useState("");
    const [visibility, setVisibility] = useState("private");
    const [avatar, setAvatar] = useState(null);

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState([]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const loadingRef = useRef(false);
    const pageRef = useRef(1);

    const loadUsers = useCallback(async (pageNum, reset = false) => {
        if (loadingRef.current) return;

        try {
            loadingRef.current = true;
            setLoading(true);

            const res = await searchGroupUsersFunct(
                debouncedSearch,
                pageNum,
                15
            );

            if (res.success) {
                setUsers((prev) => reset ? res.data : [...prev, ...res.data]);
                setHasMore(res.pagination.hasMore);
                setPage(pageNum);
                pageRef.current = pageNum;
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to search users");
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        setUsers([]);
        setPage(1);
        pageRef.current = 1;
        loadUsers(1, true);
    }, [loadUsers]);

    const loadMore = useCallback(() => {
        if (hasMore && !loadingRef.current) {
            loadUsers(pageRef.current + 1);
        }
    }, [hasMore, loadUsers]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    const toggleUser = (user) => {
        setSelected((prev) => {
            const exists = prev.some((item) => item._id === user._id);

            if (exists) {
                return prev.filter((item) => item._id !== user._id);
            }

            return [...prev, user];
        });
    };

    const createGroup = async (e) => {
        e.preventDefault();
        setError("");

        if (!groupName.trim()) {
            return setError("Group name is required");
        }

        if (selected.length < 2) {
            return setError("Select at least two users");
        }

        try {
            setCreating(true);

            const res = await createGroupFunct({
                groupName: groupName.trim(),
                bio: bio.trim(),
                visibility,
                avatar,
                memberIds: selected.map((user) => user._id),
            });

            if (res.success) {
                onCreated(res.data.card);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create group");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="create-group-overlay">
            <div className="create-group">
                <div className="create-group-header">
                    <h3>Create Group</h3>
                    <button type="button" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={createGroup}>
                    <input
                        placeholder="Group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />

                    <textarea
                        placeholder="Bio (optional)"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />

                    <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                    >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                    </select>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                    />

                    <p>Selected users: {selected.length}</p>

                    <input
                        placeholder="Search username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="group-user-list">
                        {users.map((user) => {
                            const checked = selected.some(
                                (item) => item._id === user._id
                            );

                            return (
                                <div
                                    className={`group-user ${checked ? "selected" : ""}`}
                                    key={user._id}
                                    onClick={() => toggleUser(user)}
                                >
                                    <img src={user.avatar || defaultAvatar} alt="" />

                                    <div>
                                        <strong>@{user.userName}</strong>
                                        <small>
                                            {user.fullName} · {user.isFriend ? "Friend" : "Non-friend"}
                                        </small>
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        readOnly
                                    />
                                </div>
                            );
                        })}

                        <div ref={sentinelRef} />

                        {loading && <p>Loading...</p>}
                    </div>

                    {error && <p className="group-error">{error}</p>}

                    <button
                        className="group-submit"
                        type="submit"
                        disabled={creating}
                    >
                        {creating ? "Creating..." : "Create Group"}
                    </button>
                </form>
            </div>
        </div>
    );
}