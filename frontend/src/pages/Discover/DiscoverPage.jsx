import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce.js";
import useInfiniteScroll from "../../hooks/useInfiniteScroll.js";

import UserCard from "./UserCard.jsx";
import GroupCard from "./GroupCard.jsx";
import DetailViewModal from "./DetailViewModal.jsx";

import { getDiscoverFeedFunct } from "../../api/discover.api.js";

import "../../styles/Discover/DiscoverPage.style.css";

import { joinGroupFunct } from "../../api/group.api.js";

function DiscoverPage() {

    const [joiningGroupId, setJoiningGroupId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(
        searchTerm,
        400
    );

    const [cards, setCards] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [isSearchVisible, setIsSearchVisible] =
        useState(true);

    const lastScrollY = useRef(0);

    const pageRef = useRef(1);
    const hasMoreRef = useRef(true);
    const isLoadingRef = useRef(false);

    const [selectedItem, setSelectedItem] =
        useState(null);

    const [selectedType, setSelectedType] =
        useState(null);

    pageRef.current = page;
    hasMoreRef.current = hasMore;
    isLoadingRef.current = isLoading;

    const navigate = useNavigate();

    const handleMessage = (user) => {
        navigate("/conversations", {
            state: {
                openUserId: user._id,
                conversationTab:
                    user.relationshipStatus === "friend"
                        ? "friends"
                        : "temporary",
            },
        });
    };

    /*
     * Prevent background page scrolling while modal
     * is open.
     */
    useEffect(() => {
        if (selectedItem) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedItem]);

    /*
     * Hide/show search bar based on scroll direction.
     */
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY =
                window.scrollY ||
                document.documentElement.scrollTop ||
                document.body.scrollTop;

            const scrollDiff =
                currentScrollY -
                lastScrollY.current;

            if (currentScrollY <= 20) {
                setIsSearchVisible(true);
            } else if (scrollDiff > 8) {
                setIsSearchVisible(false);
            } else if (scrollDiff < -8) {
                setIsSearchVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener(
            "scroll",
            handleScroll,
            { passive: true }
        );

        return () => {
            window.removeEventListener(
                "scroll",
                handleScroll
            );
        };
    }, []);

    /*
     * Discover feed loader.
     */
    const fetchDiscoverFeed = async (
        pageNum,
        searchVal,
        isNewSearch = false
    ) => {
        if (
            isLoadingRef.current &&
            !isNewSearch
        ) {
            return;
        }

        try {
            setIsLoading(true);
            isLoadingRef.current = true;

            const response =
                await getDiscoverFeedFunct(
                    searchVal,
                    pageNum,
                    10
                );

            const newCards =
                response?.data || [];

            const pagination =
                response?.pagination || {};

            setCards((previousCards) => {
                if (isNewSearch) {
                    return newCards;
                }

                return [
                    ...previousCards,
                    ...newCards,
                ];
            });

            const nextHasMore =
                pagination.hasMore ?? false;

            setHasMore(nextHasMore);
            hasMoreRef.current =
                nextHasMore;

            setPage(pageNum);
            pageRef.current = pageNum;
        } catch (error) {
            console.error(
                "Failed to fetch discover feed:",
                error
            );
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    };

    /*
     * Search changes.
     */
    useEffect(() => {
        setPage(1);
        pageRef.current = 1;

        setHasMore(true);
        hasMoreRef.current = true;

        fetchDiscoverFeed(
            1,
            debouncedSearch,
            true
        );
    }, [debouncedSearch]);

    /*
     * Infinite scroll.
     */
    const loadMore = useCallback(() => {
        if (
            isLoadingRef.current ||
            !hasMoreRef.current ||
            selectedItem
        ) {
            return;
        }

        const nextPage =
            pageRef.current + 1;

        fetchDiscoverFeed(
            nextPage,
            debouncedSearch,
            false
        );
    }, [
        debouncedSearch,
        selectedItem,
    ]);

    const sentinelRef =
        useInfiniteScroll(
            loadMore,
            hasMore,
            isLoading
        );

    /*
     * IMPORTANT:
     *
     * The modal opens IMMEDIATELY.
     *
     * We do NOT call getUserProfileFunct()
     * here anymore.
     *
     * DetailViewModal itself loads the full
     * profile after mounting.
     */
    const handleCardClick = (card) => {
        if (!card?._id) {
            console.error(
                "Invalid discover card:",
                card
            );
            return;
        }

        setSelectedType(
            card.cardType === "group"
                ? "group"
                : "user"
        );

        setSelectedItem(card);
    };

    /*
     * Modal can send updated user information
     * back to DiscoverPage.
     */
    const handleDetailDataUpdate =
        useCallback((updatedData) => {
            if (!updatedData?._id) {
                return;
            }

            setSelectedItem((previous) => ({
                ...(previous || {}),
                ...updatedData,
            }));

            setCards((previousCards) =>
                previousCards.map((card) => {
                    if (
                        card.cardType !==
                            "user" ||
                        card._id?.toString() !==
                            updatedData._id?.toString()
                    ) {
                        return card;
                    }

                    return {
                        ...card,
                        ...updatedData,
                    };
                })
            );
        }, []);

    const handleCloseModal = () => {
        setSelectedItem(null);
        setSelectedType(null);
    };

    const handleJoinGroup = async (group) => {
        if (joiningGroupId) return;

        try {
            setJoiningGroupId(group._id);

            const res = await joinGroupFunct(group._id);

            setCards((prev) =>
                prev.map((card) =>
                    card.cardType === "group" &&
                    card._id?.toString() === group._id.toString()
                        ? {
                            ...card,
                            isMember: true,
                            conversationId: res.data.conversationId,
                            membersCount: (card.membersCount || 0) + 1,
                        }
                        : card
                )
            );
        } catch (err) {
            console.error(err);
        } finally {
            setJoiningGroupId(null);
        }
    };

    const handleGroupMessage = (group) => {
        navigate("/conversations", {
            state: {
                openGroup: {
                    groupId: group._id,
                    conversationId: group.conversationId,
                    groupName: group.groupName,
                    avatar: group.avatar,
                },
            },
        });
    };

    return (
        <div className="discover-container">
            <div className="discover-search-sticky-container">
                <div
                    className={`discover-search-wrapper ${
                        !isSearchVisible
                            ? "search-hidden"
                            : ""
                    }`}
                >
                    <input
                        type="text"
                        className="discover-search-input"
                        placeholder="Search users or public groups..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />
                </div>
            </div>

            <div className="discover-feed-list">
                {cards.map((card) => (
                    <div
                        key={`${card.cardType}-${card._id}`}
                        className="discover-item-wrapper"
                        onClick={() =>
                            handleCardClick(
                                card
                            )
                        }
                    >
                        {card.cardType ===
                        "user" ? (
                            <UserCard
                                user={card}
                                onMessage={handleMessage}
                            />
                        ) : (
                            <GroupCard
                                group={card}
                                onJoin={handleJoinGroup}
                                onMessage={handleGroupMessage}
                                joining={joiningGroupId === card._id}
                            />
                        )}
                    </div>
                ))}
            </div>

            {!isLoading &&
                cards.length === 0 && (
                    <div className="discover-empty-state">
                        <p>
                            No results found.
                        </p>
                    </div>
                )}

            <div
                ref={sentinelRef}
                className="discover-loader"
            >
                {isLoading && (
                    <p>Loading more...</p>
                )}
            </div>

            {selectedItem && (
                <DetailViewModal
                    data={selectedItem}
                    type={selectedType}
                    onClose={
                        handleCloseModal
                    }
                    onDataUpdate={
                        handleDetailDataUpdate
                    }
                />
            )}
        </div>
    );
}

export default DiscoverPage;