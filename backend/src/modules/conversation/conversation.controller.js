import { getConversationsService } from "./conversation.service.js";

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const tab = req.query.tab === "temporary" ? "temporary" : "friends";
        const search = req.query.search || "";
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 15;

        const result = await getConversationsService({
            userId,
            tab,
            search,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            data: result.conversations,
            pagination: result.pagination,
        });
    } 
    catch (error) {
        console.error("Error fetching conversations:", error);
        
        return res.status(500).json({
            success: false,
            message: "Failed to fetch conversations",
            error: error.message,
        });
    }
};