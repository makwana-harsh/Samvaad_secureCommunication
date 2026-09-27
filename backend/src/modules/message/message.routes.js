import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { getMessages, sendMessage, sendAttachment,downloadAttachment  } from "./message.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = Router();

router.get("/:conversationId", verifyJWT, getMessages);
router.post("/:conversationId", verifyJWT, sendMessage);
router.post("/:conversationId/attachment",verifyJWT,upload.single("file"),sendAttachment);
router.get("/attachment/:messageId/download",verifyJWT,downloadAttachment);

export default router;