import { registerSchema, loginSchema } from "./auth.validation.js";
import { registerUser, loginUser, verifyAndGenerateAccessToken } from "./auth.service.js";

export const registerUserFunct = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const user = await registerUser(validatedData);

        return res.status(201).json({
            message: "User registered successfully",
            user
        });
    } 
    catch (error) {
        if (error.name === "ZodError" || error.issues) {
            const exactZodMessage = error.issues?.[0]?.message || "Invalid input data";
            return res.status(400).json({
                message: exactZodMessage,
                errors: error.issues,
            });
        }

        return res.status(400).json({
            message: error.message || "Registration failed",
        });
    }
};

export const loginUserFunct = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { accessToken, refreshToken, user } = await loginUser(validatedData);

        const isProd = process.env.NODE_ENV === "production";

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user
        });
    } 
    catch (error) {
        if (error.name === "ZodError" || error.issues) {
            const exactZodMessage = error.issues?.[0]?.message || "Invalid input data";
            return res.status(400).json({
                message: exactZodMessage,
                errors: error.issues,
            });
        }

        return res.status(400).json({
            message: error.message || "Login failed",
        });
    }
};

export const logoutUserFunct = async (req, res) => {
    try {
        const isProd = process.env.NODE_ENV === "production";

        // Clear the refreshToken HTTP-Only cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "strict" : "lax"
        });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Logout failed" });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token missing" });
        }

        const { accessToken, user } = await verifyAndGenerateAccessToken(refreshToken);

        return res.status(200).json({ 
            accessToken,
            user 
        });
    } 
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
};