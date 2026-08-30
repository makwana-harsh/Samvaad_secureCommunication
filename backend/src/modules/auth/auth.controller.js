import { registerSchema, loginSchema } from "./auth.validation.js";
import { registerUser, loginUser, verifyAndGenerateAccessToken } from "./auth.service.js";

export const registerUserFunct = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const user = await registerUser(validatedData);

        return res.status(201).json({
            message: "User registered successfully", user
        });
    } 
    catch (error) {
        // console.log("This is the error from register-controller-route >>> \n", error);
        // 1. Catch Zod Error and get the message from `error.issues`
        if (error.name === "ZodError" || error.issues) {
        // Pulls "Password must be at least 6 characters" directly
            const exactZodMessage = error.issues?.[0]?.message || "Invalid input data";

            return res.status(400).json({
                message: exactZodMessage,
                errors: error.issues,
            });
        }

        // 2. Catch standard errors (e.g., duplicate email / database errors)
        return res.status(400).json({
            message: error.message || "Registration failed",
        });
    }
};

export const loginUserFunct = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { accessToken, refreshToken, user } = await loginUser(validatedData);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user
        });
    } 
    catch (error) {
        // console.log("This is the error from login-controller-route >>> \n", error);
        // 1. Catch Zod Error and get the message from `error.issues`
        if (error.name === "ZodError" || error.issues) {
        // Pulls "Password must be at least 6 characters" directly
            const exactZodMessage = error.issues?.[0]?.message || "Invalid input data";

            return res.status(400).json({
                message: exactZodMessage,
                errors: error.issues,
            });
        }

        // 2. Catch standard errors (e.g., duplicate email / database errors)
        return res.status(400).json({
            message: error.message || "Login failed",
        });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token missing" });
        }
        const accessToken = verifyAndGenerateAccessToken(refreshToken);
        return res.status(200).json({ accessToken });
    } 
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
};