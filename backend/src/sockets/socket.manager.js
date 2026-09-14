import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const userSocketMap = new Map(); // userId -> Set(socket.id)
let io = null;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    // Verify JWT on Handshake
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            // Uses your exact JWT Access Token Secret
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
            socket.userId = decoded.id;
            socket.userName = decoded.userName;
            next();
        } 
        catch (err) {
            return next(new Error("Authentication error: Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.userId.toString();

        // Map User ID -> Socket ID(s)
        if (!userSocketMap.has(userId)) {
            userSocketMap.set(userId, new Set());
        }
        
        userSocketMap.get(userId).add(socket.id);

        socket.on("disconnect", () => {
        const userSockets = userSocketMap.get(userId);
        if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
                userSocketMap.delete(userId);
            }
        }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};

// Emit real-time updates to a specific user
export const emitToUser = (userId, eventName, data) => {
    const userSockets = userSocketMap.get(userId.toString());
    if (userSockets && io) {
        userSockets.forEach((socketId) => {
            io.to(socketId).emit(eventName, data);
        });
    }
};