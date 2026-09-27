import {
    getConversationsService,
    getOrCreatePrivateConversationService,
    getOnlineFriendsService,
} from "./conversation.service.js";

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const tab = req.query.tab === "temporary" ? "temporary" : "friends";
        const search = req.query.search?.trim() || "";
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 50);

        const result = await getConversationsService({ userId, tab, search, page, limit });

        res.status(200).json({
            success: true,
            data: result.conversations,
            pagination: result.pagination,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch conversations",
        });
    }
};

export const getOrCreatePrivateConversation = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const result = await getOrCreatePrivateConversationService(userId, req.params.targetUserId);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to open conversation",
        });
    }
};

export const getOnlineFriends = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const friends = await getOnlineFriendsService(userId);

        res.status(200).json({
            success: true,
            data: friends,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch online friends",
        });
    }
};