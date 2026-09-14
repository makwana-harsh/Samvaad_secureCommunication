import express from "express";
import { getDiscoverFeed } from "./discover.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyJWT, getDiscoverFeed);

export default router;