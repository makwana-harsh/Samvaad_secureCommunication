import { Router } from "express";
import { getConversations } from "./conversation.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Route: GET /api/conversations?tab=friends&search=rahul&page=1&limit=15
router.get("/", verifyJWT, getConversations);

export default router;