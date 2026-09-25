import React, { useState, useEffect } from "react";
import { FiSearch, FiUserPlus, FiInfo } from "react-icons/fi";
import useDebounce from "../../hooks/useDebounce";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import UserCard from "./UserCard";
import GroupCard from "./GroupCard";
import CreateGroupModal from "./CreateGroupModal";
import "../../styles/Conversations/Sidebar.style.css";

export default function Sidebar({activeTab,setActiveTab,cards,onSelectCard,selectedCard,onSearchChange,fetchMore,hasMore,isLoading,onGroupCreated,
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const sentinelRef = useInfiniteScroll(fetchMore, hasMore, isLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <aside className="conv-sidebar">
      {/* Search Input */}
      <div className="sidebar-search-container">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sidebar-search-input"
        />
      </div>

      {/* Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`tab-btn ${activeTab === "friends_and_groups" ? "active" : ""}`}
          onClick={() => setActiveTab("friends_and_groups")}
        >
          Friends & Groups
        </button>
        <button
          className={`tab-btn ${activeTab === "temporary" ? "active" : ""}`}
          onClick={() => setActiveTab("temporary")}
        >
          Temporary Chats
        </button>
      </div>

      {/* Action / Info Sub-Header */}
      <div className="sidebar-sub-header">
        <span className="sub-header-title">
          {activeTab === "friends_and_groups" ? "FRIENDS & GROUPS" : "TEMPORARY CHATS"}
        </span>
        {activeTab === "friends_and_groups" ? (
          <button className="create-group-btn" onClick={() => setIsModalOpen(true)}>
            <FiUserPlus /> Create Group
          </button>
        ) : (
          <span className="temp-info-badge" title="Messages reset automatically">
            <FiInfo /> Auto-expires
          </span>
        )}
      </div>

      {/* Conversations Cards List */}
      <div className="cards-list-container">
        {cards.length === 0 && !isLoading ? (
          <div className="no-cards-msg">No conversations found</div>
        ) : (
          cards.map((card) =>
            card.type === "group" ? (
              <GroupCard
                key={card.cardId}
                card={card}
                isSelected={selectedCard?.cardId === card.cardId}
                onClick={onSelectCard}
              />
            ) : (
              <UserCard
                key={card.cardId}
                card={card}
                isSelected={selectedCard?.cardId === card.cardId}
                onClick={onSelectCard}
              />
            )
          )
        )}
        <div ref={sentinelRef} className="scroll-sentinel" />
      </div>

      {/* Create Group Modal */}
      {isModalOpen && (
        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onGroupCreated={(newGroupCard) => {
            onGroupCreated(newGroupCard);
            setActiveTab("friends_and_groups");
          }}
        />
      )}
    </aside>
  );
}