import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import ChatBox from "./ChatBox";
import { getConversationsListApi } from "../../api/conversation.api";
import useSocket from "../../hooks/useSocket";
import "../../styles/Conversations/ConversationPage.style.css";

export default function ConversationPage({ currentUserId }) {
  const [activeTab, setActiveTab] = useState("friends_and_groups");
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const socket = useSocket();

  const fetchCards = useCallback(
    async (currentPage, isNewQuery = false) => {
      try {
        setIsLoading(true);
        const res = await getConversationsListApi(activeTab, searchTerm, currentPage, 15);
        if (res.success) {
          setCards((prev) => (isNewQuery ? res.data : [...prev, ...res.data]));
          setHasMore(res.pagination.hasMore);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, searchTerm]
  );

  useEffect(() => {
    setPage(1);
    fetchCards(1, true);
  }, [activeTab, searchTerm, fetchCards]);

  const loadNextPage = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCards(nextPage, false);
    }
  };
  
  const handleGroupCreated = (newGroupCard) => {
    setCards((prevCards) => [newGroupCard, ...prevCards]);
    setSelectedCard(newGroupCard); // Automatically select the new group
  };
  
  return (
    <div className="conversation-page-wrapper">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cards={cards}
        onSelectCard={setSelectedCard}
        selectedCard={selectedCard}
        onSearchChange={setSearchTerm}
        fetchMore={loadNextPage}
        hasMore={hasMore}
        isLoading={isLoading}
        onGroupCreated={handleGroupCreated}
      />
      <main className="chat-content-panel">
        <ChatBox activeCard={selectedCard} currentUserId={currentUserId} />
      </main>
    </div>
  );
}