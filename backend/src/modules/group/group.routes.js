import express from "express";
import {
    getGroupDetails,
    joinGroup,
    leaveGroup,
    inviteUser,
    createGroup,
    updateGroup,
    acceptInvitation,
rejectInvitation,
removeGroupMember,
} from "./group.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { uploadAvatar } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, uploadAvatar.single("avatar"), createGroup);

router.get("/:groupId/details", verifyJWT, getGroupDetails);
router.post("/:groupId/join", verifyJWT, joinGroup);
router.post("/:groupId/leave", verifyJWT, leaveGroup);
router.post("/:groupId/invitations", verifyJWT, inviteUser);

router.patch("/:groupId", verifyJWT, uploadAvatar.single("avatar"), updateGroup);
router.delete("/:groupId/members/:userId", verifyJWT, removeGroupMember);

router.post("/:groupId/invitations/:requestId/accept", verifyJWT, acceptInvitation);
router.post("/:groupId/invitations/:requestId/reject", verifyJWT, rejectInvitation);

export default router;