import {fetchUserProfileService, updateUserProfileService } from "./home.service.js";
import { updateProfileSchema } from "./home.validation.js";
import { uploadUserAvatar } from "../../utils/cloudinary.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await fetchUserProfileService(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    /*
     * 1. Validate req.body using Zod schema
     */
    const validationResult = updateProfileSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.error.errors[0].message,
      });
    }

    /*
     * Only these fields are allowed
     * to be modified through profile editing.
     */
    const allowedFields = [
      "fullName",
      "mobileNo",
      "bio",
      "location",
      "dob",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    /*
     * Upload avatar if provided.
     */
    if (req.file) {
      const cloudinaryResult = await uploadUserAvatar(
        req.file.buffer,
        userId
      );

      updateData.avatar = cloudinaryResult.secure_url;
    }

    const updatedUser = await updateUserProfileService(
      userId,
      updateData
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};