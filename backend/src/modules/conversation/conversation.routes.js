import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
    getConversations,
    getOrCreatePrivateConversation,
    getOnlineFriends,
} from "./conversation.controller.js";

const router = Router();

router.get("/online-friends", verifyJWT, getOnlineFriends);

router.get("/", verifyJWT, getConversations);

router.post(
    "/private/:targetUserId",
    verifyJWT,
    getOrCreatePrivateConversation
);

export default router;