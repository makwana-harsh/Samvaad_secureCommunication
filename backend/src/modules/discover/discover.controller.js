import { discoverQuerySchema } from "./discover.validation.js";
import { getDiscoverFeedService } from "./discover.service.js";

export const getDiscoverFeed = async (req, res) => {
    try {
        const queryParams = discoverQuerySchema.parse(req.query);
        const userId = req.user.id || req.user._id;

        const feedData = await getDiscoverFeedService(userId, queryParams);

        return res.status(200).json({
            success: true,
            data: feedData.cards,
            pagination: feedData.pagination,
        });
    } 
    catch (error) {
        if (error.name === "ZodError" || error.issues) {
            return res.status(400).json({
                message: error.issues?.[0]?.message || "Invalid query parameters",
            });
        }

        return res.status(500).json({
            message: error.message || "Failed to fetch discover feed",
        });
    }
};