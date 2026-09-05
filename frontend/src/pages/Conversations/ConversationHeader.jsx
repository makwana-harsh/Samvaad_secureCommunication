import React from "react";
import "../../styles/ConversationHeader.style.css";

function ConversationHeader({activeTab, setActiveTab, searchTerm, setSearchTerm, onCreateGroupClick}) {
    return (
        <div className="conversation-header-container">
            {/* Sub-navbar Tabs */}
            <div className="conversation-tabs">
                <button
                    className={`tab-btn ${activeTab === "friends" ? "active" : ""}`}
                    onClick={() => setActiveTab("friends")}
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

            {/* Controls Bar: Search Input + Create Group Button */}
            <div className="conversation-controls">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder={
                        activeTab === "friends"
                            ? "Search @userName or group..."
                            : "Search @userName..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                            ✕
                        </button>
                    )}
                </div>

                {/* "+ Create Group" button shown only on Friends & Groups tab */}
                {activeTab === "friends" && (
                <button className="create-group-btn" onClick={onCreateGroupClick}>
                    + Create Group
                </button>
                )}
            </div>
        </div>
    );
}

export default ConversationHeader;