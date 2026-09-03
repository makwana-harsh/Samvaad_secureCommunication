import { Router } from "express";
import { getProfile, updateProfile } from "./home.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { uploadAvatar } from "../../middlewares/multer.middleware.js";

const router = Router();

router.get("/profile", verifyJWT, getProfile);
router.put("/profile/edit", verifyJWT, uploadAvatar.single("avatar"), updateProfile);

export default router;