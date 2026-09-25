import { getProfileSchema, unfriendSchema, searchMinimalUsersSchema } from "./user.validation.js";
import { getUserProfileService, unfriendUserService, searchMinimalUsersService } from "./user.service.js";

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

export const searchMinimalUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Extracted from verifyJWT
    const { search = "", page = 1, limit = 8 } = searchMinimalUsersSchema.parse(req.query);

    const data = await searchMinimalUsersService(
      currentUserId,
      search,
      Number(page),
      Number(limit)
    );

    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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