import express from "express";

import { getUserProfile, unfriendUser, searchMinimalUsers } from "./user.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:userId/profile", verifyJWT, getUserProfile);
router.post("/:targetUserId/unfriend", verifyJWT, unfriendUser);
router.get("/search-minimal", verifyJWT, searchMinimalUsers);

export default router;