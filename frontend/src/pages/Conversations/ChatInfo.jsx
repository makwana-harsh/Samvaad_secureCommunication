import React, { useEffect, useState } from "react";
import {
    getGroupDetailsFunct,
    leaveGroupFunct,
    removeGroupMemberFunct,
    searchGroupUsersFunct,
    sendGroupInvitationFunct,
    updateGroupFunct,
} from "../../api/group.api";
import { getUserProfileFunct } from "../../api/user.api";
import defaultAvatar from "../../assets/default_avatar.avif";
import defaultGroupAvatar from "../../assets/group_default_profile_pic.png";

export default function ChatInfo({ selected, onClose, onGroupLeft }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    const isGroup = selected.type === "group";

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const res = isGroup
                    ? await getGroupDetailsFunct(selected.groupId)
                    : await getUserProfileFunct(selected.userId);

                setData(res.data);
                setBio(res.data.bio || "");
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load info");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [selected, isGroup]);

    const searchUsers = async (value) => {
        setSearch(value);

        if (!value.trim()) {
            setUsers([]);
            return;
        }

        try {
            const res = await searchGroupUsersFunct(value, 1, 10);
            setUsers(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const invite = async (user) => {
        try {
            await sendGroupInvitationFunct(selected.groupId, user.userName);
            setUsers((prev) => prev.filter((item) => item._id !== user._id));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to invite user");
        }
    };

    const removeMember = async (userId) => {
        try {
            await removeGroupMemberFunct(selected.groupId, userId);

            setData((prev) => ({
                ...prev,
                members: prev.members.filter(
                    (member) => member._id !== userId
                ),
            }));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove member");
        }
    };

    const updateGroup = async () => {
        try {
            const res = await updateGroupFunct(
                selected.groupId,
                bio,
                avatar
            );

            setData((prev) => ({
                ...prev,
                bio: res.data.bio,
                avatar: res.data.avatar,
            }));

            setAvatar(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update group");
        }
    };

    const leaveGroup = async () => {
        try {
            await leaveGroupFunct(selected.groupId);
            onGroupLeft(selected.groupId);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to leave group");
        }
    };

    if (loading) {
        return <div className="chat-info"><p>Loading...</p></div>;
    }

    if (!data) {
        return (
            <div className="chat-info">
                <button onClick={onClose}>← Back</button>
                <p>{error || "Unable to load information"}</p>
            </div>
        );
    }

    if (!isGroup) {
        return (
            <div className="chat-info">
                <button className="chat-info-back" onClick={onClose}>← Back</button>

                <div className="chat-info-profile">
                    <img src={data.avatar || defaultAvatar} alt="" />
                    <h2>@{data.userName}</h2>
                    <p>{data.fullName}</p>
                    <p>{data.bio || "No bio"}</p>
                </div>

                <h3>Friends</h3>

                <div className="chat-info-list">
                    {data.friends?.map((friend) => (
                        <div className="chat-info-user" key={friend._id}>
                            <img src={friend.avatar || defaultAvatar} alt="" />
                            <span>@{friend.userName}</span>
                        </div>
                    ))}

                    {!data.friends?.length && <p>No friends to show</p>}
                </div>

                <h3>Public Groups</h3>

                <div className="chat-info-list">
                    {data.publicGroups?.map((group) => (
                        <div className="chat-info-group" key={group._id}>
                            <strong>{group.groupName}</strong>
                            <small>{group.bio || "No bio"}</small>
                        </div>
                    ))}

                    {!data.publicGroups?.length && <p>No public groups</p>}
                </div>

                {data.privateGroups?.length > 0 && (
                    <>
                        <h3>Private Groups</h3>

                        <div className="chat-info-list">
                            {data.privateGroups.map((group) => (
                                <div className="chat-info-group" key={group._id}>
                                    <strong>{group.groupName}</strong>
                                    <small>{group.bio || "No bio"}</small>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="chat-info">
            <button className="chat-info-back" onClick={onClose}>← Back</button>

            <div className="chat-info-profile">
                <img src={data.avatar || defaultGroupAvatar} alt="" />
                <h2>{data.groupName}</h2>
                <p>{data.bio || "No bio"}</p>
                <small>{data.visibility}</small>
            </div>

            {data.isAdmin && (
                <div className="chat-info-admin">
                    <h3>Edit Group</h3>

                    <textarea
                        value={bio}
                        placeholder="Group bio"
                        onChange={(e) => setBio(e.target.value)}
                    />

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                    />

                    <button onClick={updateGroup}>Save Changes</button>

                    <h3>Add User</h3>

                    <input
                        value={search}
                        placeholder="Search username..."
                        onChange={(e) => searchUsers(e.target.value)}
                    />

                    {users.map((user) => (
                        <div className="chat-info-user" key={user._id}>
                            <img src={user.avatar || defaultAvatar} alt="" />

                            <div>
                                <strong>@{user.userName}</strong>
                                <small>
                                    {user.fullName} · {user.isFriend ? "Friend" : "Non-friend"}
                                </small>
                            </div>

                            <button onClick={() => invite(user)}>Invite</button>
                        </div>
                    ))}
                </div>
            )}

            <h3>Members ({data.members?.length || 0})</h3>

            <div className="chat-info-list">
                {data.members?.map((member) => (
                    <div className="chat-info-user" key={member._id}>
                        <img src={member.avatar || defaultAvatar} alt="" />

                        <div>
                            <strong>@{member.userName}</strong>

                            {member._id === data.admin?._id && (
                                <small>Admin</small>
                            )}
                        </div>

                        {data.isAdmin && member._id !== data.admin?._id && (
                            <button onClick={() => removeMember(member._id)}>
                                Remove
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {!data.isAdmin && (
                <button className="leave-group-btn" onClick={leaveGroup}>
                    Leave Group
                </button>
            )}

            {error && <p className="group-error">{error}</p>}
        </div>
    );
}