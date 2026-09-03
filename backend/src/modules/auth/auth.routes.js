import express from "express";

import {registerUserFunct, loginUserFunct , logoutUserFunct, refreshAccessToken} from './auth.controller.js';

const router = express.Router();

router.post("/register", registerUserFunct);
router.post("/login", loginUserFunct);
router.post("/logout", logoutUserFunct);
router.post("/refresh", refreshAccessToken);

export default router;