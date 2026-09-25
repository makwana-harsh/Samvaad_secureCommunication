import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { getConversationsController } from "./conversation.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/", verifyJWT,getConversationsController);

export default router;