import React from "react";
import FriendCard from "./FriendCard";
import NonFriendCard from "./NonFriendCard";
import GroupCard from "./GroupCard";
import "../../styles/ChatCard.style.css";

function ChatCard({ conversation, onClick }) {
    if (!conversation) return null;

    switch (conversation.type) {
        case "friend":
            return <FriendCard conversation={conversation} onClick={onClick} />;
        case "non-friend":
            return <NonFriendCard conversation={conversation} onClick={onClick} />;
        case "group":
            return <GroupCard conversation={conversation} onClick={onClick} />;
        default:
            return <FriendCard conversation={conversation} onClick={onClick} />;
    }
}

export default ChatCard;