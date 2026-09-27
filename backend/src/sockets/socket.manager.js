import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const userSocketMap = new Map();
let io = null;

const notifyFriends = async (userId, eventName, data) => {
    const user = await User.findById(userId).select("friends").lean();
    if (!user) return;

    (user.friends || []).forEach((friendId) => {
        emitToUser(friendId, eventName, data);
    });
};

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

        if (!token) return next(new Error("Authentication error: No token provided"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
            socket.userId = decoded.id;
            socket.userName = decoded.userName;
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid or expired token"));
        }
    });

    io.on("connection", async (socket) => {
        const userId = socket.userId.toString();
        const wasOffline = !userSocketMap.has(userId);

        if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
        userSocketMap.get(userId).add(socket.id);

        if (wasOffline) {
            await User.findByIdAndUpdate(userId, { isOnline: true });
            await notifyFriends(userId, "user:online", { userId });
        }

        socket.on("disconnect", async () => {
            const sockets = userSocketMap.get(userId);
            if (!sockets) return;

            sockets.delete(socket.id);
            if (sockets.size > 0) return;

            userSocketMap.delete(userId);

            const lastSeen = new Date();
            await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });

            await notifyFriends(userId, "user:offline", {
                userId,
                lastSeen,
            });
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
};

export const emitToUser = (userId, eventName, data) => {
    const sockets = userSocketMap.get(userId.toString());
    if (!sockets || !io) return;

    sockets.forEach((socketId) => {
        io.to(socketId).emit(eventName, data);
    });
};

export const isUserOnline = (userId) => {
    return userSocketMap.has(userId.toString());
};