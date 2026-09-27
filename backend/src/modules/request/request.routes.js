import express from "express";
import {sendRequest, cancelRequest, acceptRequest, rejectRequest,getPendingRequests,} from "./request.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send", verifyJWT, sendRequest);
router.post("/cancel", verifyJWT, cancelRequest);
router.post("/accept", verifyJWT, acceptRequest);
router.post("/reject", verifyJWT, rejectRequest);
router.get("/pending", verifyJWT, getPendingRequests);

export default router;