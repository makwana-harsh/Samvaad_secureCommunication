import React, { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import useSocket from "../../hooks/useSocket";
import "../../styles/Conversations/ChatBox.style.css";

export default function ChatBox({ activeCard, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  const conversationId = activeCard?.conversationId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Join socket room and load initial messages
  useEffect(() => {
    if (!conversationId || !socket) return;

    // Clear active message list
    setMessages([]);

    // Join specific conversation room
    socket.emit("conversation:join", { conversationId });

    // Optional API fetch for historical messages goes here:
    // getMessagesApi(conversationId).then(data => setMessages(data));

    // Listen for incoming real-time messages
    const handleNewMessage = (incomingMsg) => {
      if (incomingMsg.conversationId === conversationId) {
        setMessages((prev) => [...prev, incomingMsg]);
      }
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message:new", handleNewMessage);
    };
  }, [conversationId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text) => {
    if (!text.trim() || !socket || !conversationId) return;

    socket.emit("message:send", {
      conversationId,
      content: text,
      messageType: "text",
    });
  };

  if (!activeCard) {
    return (
      <div className="no-chat-selected">
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chatbox-container">
      <ChatHeader activeCard={activeCard} />

      <div className="messages-area">
        <div className="date-divider">
          <span>Today</span>
        </div>
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}