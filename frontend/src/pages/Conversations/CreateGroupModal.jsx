import React, { useState, useEffect, useCallback } from "react";
import { FiX, FiSearch, FiCamera, FiGlobe, FiLock, FiUserPlus } from "react-icons/fi";
import useDebounce from "../../hooks/useDebounce";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { searchMinimalUsersApi } from "../../api/user.api";
import {  createGroupApi } from "../../api/group.api";
import "../../styles/Conversations/CreateGroupModal.style.css";
import defaultAvatar from "../../assets/default_avatar.avif";

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated, currentUser }) {
  const [groupName, setGroupName] = useState("");
  const [bio, setBio] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  // Member Search State
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const fetchUsers = useCallback(async (currentPage, isNewQuery = false) => {
    try {
      setIsLoading(true);
      const res = await searchMinimalUsersApi(debouncedSearch, currentPage, 8);
      console.log("SEARCH USERS:", res.users);
      if (res.success) {
        setUsers((prev) => (isNewQuery ? res.users : [...prev, ...res.users]));
        setHasMore(res.pagination.hasMore);
      }
    } catch (err) {
      console.error("Failed to search users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (!isOpen) return;

    if (!debouncedSearch.trim()) {
      setUsers([]);
      setPage(1);
      setHasMore(false);
      return;
    }

    setPage(1);
    fetchUsers(1, true);
  }, [debouncedSearch, isOpen, fetchUsers]);

  const loadMoreUsers = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(nextPage, false);
    }
  };

  const sentinelRef = useInfiniteScroll(loadMoreUsers, hasMore, isLoading);

  if (!isOpen) return null;

  const toggleSelectUser = (user) => {
    if (selectedMembers.some((m) => m._id === user._id)) {
      setSelectedMembers((prev) => prev.filter((m) => m._id !== user._id));
    } else {
      setSelectedMembers((prev) => [...prev, user]);
    }
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!groupName.trim()) {
      setErrorMsg("Please enter a group name.");
      return;
    }

    if (selectedMembers.length < 2) {
      setErrorMsg("Select at least 2 members to create a group.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append("groupName", groupName.trim());
      formData.append("visibility", visibility);
      formData.append(
          "memberIds",
          JSON.stringify(selectedMembers.map((m) => m._id))
      );

      if (bio.trim()) {
          formData.append("bio", bio.trim());
      }

      if (avatarFile) {
          formData.append("avatar", avatarFile);
      }

      const res = await createGroupApi(formData);

      if (res.success) {
        const { group, conversationId, message } = res.data;

        // Format the group into a proper Card structure that matches getConversationsListApi
        const newGroupCard = {
          cardId: group._id,               // or group._id / conversationId depending on your frontend logic
          conversationId: conversationId,
          type: "group",
          name: group.groupName,           // Ensures group name displays instead of "Unknown"
          groupName: group.groupName,
          avatar: group.avatar || "",
          visibility: group.visibility,
          lastMessage: message?.content || `You created "${group.groupName}"`, // Fixes "No message yet"
          lastMessageAt: message?.createdAt || new Date().toISOString(),
          unreadCount: 0,
        };

        onGroupCreated(newGroupCard);
        onClose();
      }


    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="create-group-modal">
        <div className="modal-header">
          <h3>Create New Group</h3>
          <button className="close-modal-btn" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Avatar Upload section */}
          <div className="avatar-upload-section">
            <label className="avatar-preview-box">
                {avatarPreview ? (
                    <img
                        src={avatarPreview}
                        alt="Group avatar preview"
                        className="group-avatar-preview"
                    />
                ) : (
                    <FiCamera className="camera-icon" />
                )}

                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                    }}
                />
            </label>

            <span className="upload-label">Upload Avatar</span>
          </div>

          {/* Group Name */}
          <div className="form-group">
            <label className="form-label">Group Name <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={40}
              className="modal-input"
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label className="form-label">Bio / Description</label>
            <textarea
              placeholder="A space for developers to discuss web technologies..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={250}
              className="modal-textarea"
            />
          </div>

          {/* Visibility */}
          <div className="form-group">
            <label className="section-sub-title">VISIBILITY OPTIONS</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                />
                <FiGlobe /> Public (anyone can join)
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                />
                <FiLock /> Private (invite-only)
              </label>
            </div>
          </div>

          {/* Members Selection */}
          <div className="form-group">
            <label className="section-sub-title">MEMBERS SELECTION</label>
            <label className="form-label">Add Members <span className="required">*</span></label>
            
            {/* Selected Chips */}
            <div className="chips-container">
              <span className="chip admin-chip">You (Admin) <FiLock className="chip-lock" /></span>
              {selectedMembers.map((member) => (
                <span key={member._id} className="chip member-chip">
                  {member.fullName || member.userName}
                  <FiX className="remove-chip-icon" onClick={() => removeMember(member._id)} />
                </span>
              ))}
            </div>

            {/* User Search Input */}
            <div className="modal-search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modal-search-input"
              />
            </div>

            {/* Paginated User Selection List */}
            <div className="user-selection-list">
              {users.map((u) => {
                const isSelected = selectedMembers.some((m) => m._id === u._id);
                return (
                  <div key={u._id} className="user-select-item" onClick={() => toggleSelectUser(u)} >
                    <input type="checkbox" checked={isSelected} readOnly />
                    <img
                      src={u.avatar || defaultAvatar}
                      alt={u.userName}
                      className="user-select-avatar"
                    />
                    <div className="user-select-names">
                      <span className="user-display-name">{u.fullName || "Not Available "}</span>
                      <span className="user-handle">(@{u.userName})</span>
                    </div>
                    {/* ADD ONLY THIS */}
                    {u.isFriend && (
                      <span className="friend-badge">
                        Friend
                      </span>
                    )}

                  </div>
                );
              })}
              <div ref={sentinelRef} className="scroll-sentinel" />
            </div>
          </div>

          {errorMsg && <p className="error-message">{errorMsg}</p>}

          {/* Modal Actions */}
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              <FiUserPlus /> {isSubmitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}