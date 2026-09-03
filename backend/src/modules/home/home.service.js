import User from "../../models/User.model.js";

export const fetchUserProfileService = async (userId) => {
    return await User.findById(userId).select("-password");
};

export const updateUserProfileService = async (userId, updateData) => {
    return await User.findByIdAndUpdate(userId, updateData, { 
        returnDocument: "after",
        runValidators: true 
    }).select("-password");
};