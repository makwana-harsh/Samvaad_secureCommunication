import express from "express";
import { getGroupDetails, joinGroup, leaveGroup, inviteUser, acceptInvitation, rejectInvitation } from "./group.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:groupId/details", verifyJWT, getGroupDetails);
router.post("/:groupId/join", verifyJWT, joinGroup);
router.post("/:groupId/leave", verifyJWT, leaveGroup);
router.post("/:groupId/invitations", verifyJWT, inviteUser);
// router.post("/:groupId/invitations/:requestId/accept", verifyJWT, acceptInvitation);
// router.post("/:groupId/invitations/:requestId/reject", verifyJWT, rejectInvitation);

export default router;