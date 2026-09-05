import React, { useState, useEffect, useCallback } from "react";
import ChatCard from "./ChatCard";
import ActiveChat from "./ActiveChat";
import CreateGroupModal from "./CreateGroupModal";
import { getConversationsApi } from "../../api/conversation.api";
import { useDebounce } from "../../hooks/useDebounce";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import "../../styles/ConversationPage.style.css";

function ConversationPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Reset active chat when tab changes to avoid stale view
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setActiveConversation(null);
  };

  const fetchConversations = useCallback(
    async (pageNum, isNewFilter = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getConversationsApi({
          tab: activeTab,
          search: debouncedSearch,
          page: pageNum,
          limit: 15,
        });

        if (response.success) {
          const newItems = response.data || [];
          setConversations((prev) =>
            isNewFilter ? newItems : [...prev, ...newItems]
          );
          setHasMore(response.pagination?.hasMore ?? false);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setError("Failed to load conversations.");
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, debouncedSearch]
  );

  useEffect(() => {
    setPage(1);
    fetchConversations(1, true);
  }, [activeTab, debouncedSearch, fetchConversations]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchConversations(nextPage, false);
    }
  }, [isLoading, hasMore, page, fetchConversations]);

  const observerRef = useInfiniteScroll(handleLoadMore, hasMore, isLoading);

  return (
    <div className="layout-root">
      {/* PART 1: GLOBAL TOP SEARCH BAR */}
      <div className="top-search-bar">
        <input
          type="text"
          placeholder="Search friends, groups, or temporary chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {activeTab === "friends" && (
          <button
            className="create-group-btn"
            onClick={() => setIsGroupModalOpen(true)}
          >
            + New Group
          </button>
        )}
      </div>

      {/* PART 2: SPLIT CONTAINER */}
      <div className="main-split-container">
        {/* SIDEBAR: NAV & LIST */}
        <div className="sidebar-section">
          <nav className="tab-navbar">
            <button
              className={`tab-btn ${activeTab === "friends" ? "active" : ""}`}
              onClick={() => handleTabChange("friends")}
            >
              Friends & Groups
            </button>
            <button
              className={`tab-btn ${activeTab === "temporary" ? "active" : ""}`}
              onClick={() => handleTabChange("temporary")}
            >
              Temporary
            </button>
          </nav>

          <div className="cards-list scrollable">
            {conversations.map((item) => {
              const itemId = item._id || item.conversationId;
              const activeId =
                activeConversation?._id || activeConversation?.conversationId;

              return (
                <ChatCard
                  key={itemId}
                  conversation={item}
                  isSelected={itemId === activeId}
                  onClick={() => setActiveConversation(item)}
                />
              );
            })}

            {isLoading && <div className="state-msg">Loading...</div>}
            {!isLoading && conversations.length === 0 && (
              <div className="state-msg">
                {debouncedSearch
                  ? `No results for "${debouncedSearch}"`
                  : "No conversations found."}
              </div>
            )}
            {error && <div className="state-msg error">{error}</div>}

            <div ref={observerRef} style={{ height: "5px" }} />
          </div>
        </div>

        {/* MAIN DISPLAY: CHATBOX CONTAINER */}
        <div className="chatbox-section">
          <ActiveChat conversation={activeConversation} />
        </div>
      </div>

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onCreateGroup={() => fetchConversations(1, true)}
      />
    </div>
  );
}

export default ConversationPage;