// backend/src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
    try {
        const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized request" });
        }

        // Must match JWT_ACCESS_TOKEN_SECRET from .env
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

        req.user = decodedToken;
        next();
    } 
    catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired access token" });
    }
};


