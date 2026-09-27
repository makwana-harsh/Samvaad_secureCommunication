import { getProfileSchema, unfriendSchema } from "./user.validation.js";
import { getUserProfileService, unfriendUserService, searchUsersService  } from "./user.service.js";


export const getUserProfile = async (req, res) => {
    try {
        const { userId } = getProfileSchema.parse(req.params);
        const currentUserId = req.user.id || req.user._id;

        const profileData = await getUserProfileService(currentUserId, userId);

        return res.status(200).json({
            success: true,
            data: profileData,
        });
    } 
    catch (error) {
        if (error.name === "ZodError" || error.issues) {
            return res.status(400).json({ message: error.issues?.[0]?.message || "Invalid payload" });
        }
        return res.status(500).json({ message: error.message || "Failed to fetch profile" });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id || req.user._id;
        const search = req.query.search?.trim() || "";
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 30);

        const result = await searchUsersService(currentUserId, search, page, limit);

        return res.status(200).json({
            success: true,
            data: result.users,
            pagination: result.pagination,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to search users",
        });
    }
};

export const unfriendUser = async (req, res) => {
    try {
        const { targetUserId } = unfriendSchema.parse(req.params);
        const currentUserId = req.user.id || req.user._id;

        await unfriendUserService(currentUserId, targetUserId);

        return res.status(200).json({
            success: true,
            message: "User unfriended successfully",
        });
    } catch (error) {
        if (error.name === "ZodError" || error.issues) {
            return res.status(400).json({ message: error.issues?.[0]?.message || "Invalid payload" });
        }
        return res.status(500).json({ message: error.message || "Failed to unfriend user" });
    }
};