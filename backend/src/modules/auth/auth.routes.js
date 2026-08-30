import express from "express";

import {registerUserFunct, loginUserFunct ,refreshAccessToken} from './auth.controller.js';

const router = express.Router();

router.post("/register", registerUserFunct);
router.post("/login", loginUserFunct);
router.post("/refresh", refreshAccessToken);

export default router;