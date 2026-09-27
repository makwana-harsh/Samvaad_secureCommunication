import express from "express";
import { getUserProfile, unfriendUser, searchUsers } from "./user.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/search", verifyJWT, searchUsers);
router.get("/:userId/profile", verifyJWT, getUserProfile);
router.post("/:targetUserId/unfriend", verifyJWT, unfriendUser);

export default router;