import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.model.js";
import Conversation from "../models/Conversation.model.js";

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
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
      socket.userId = decoded.id;
      socket.userName = decoded.userName;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId.toString();

    // Track active user sockets
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    // Join Conversation Room
    socket.on("conversation:join", ({ conversationId }) => {
      if (conversationId) {
        socket.join(conversationId.toString());
      }
    });

    // Leave Conversation Room
    socket.on("conversation:leave", ({ conversationId }) => {
      if (conversationId) {
        socket.leave(conversationId.toString());
      }
    });

    // Handle Sending Messages
    socket.on("message:send", async ({ conversationId, content, messageType = "text" }) => {
      try {
        if (!conversationId || !content?.trim()) return;

        // 1. Create message in DB
        const newMessage = await Message.create({
          conversationId,
          senderId: socket.userId,
          messageType,
          content,
        });

        // 2. Update parent conversation metadata
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content,
          lastMessageSenderId: socket.userId,
          lastMessageAt: newMessage.createdAt,
        });

        // 3. Payload format matching frontend requirements
        const messagePayload = {
          _id: newMessage._id,
          conversationId,
          senderId: socket.userId,
          senderUserName: socket.userName,
          messageType: newMessage.messageType,
          content: newMessage.content,
          createdAt: newMessage.createdAt,
        };

        // 4. Emit to everyone inside the conversation room
        io.to(conversationId.toString()).emit("message:new", messagePayload);
      } catch (error) {
        socket.emit("message:error", { message: "Failed to send message" });
      }
    });

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

export const emitToUser = (userId, eventName, data) => {
  const userSockets = userSocketMap.get(userId.toString());
  if (userSockets && io) {
    userSockets.forEach((socketId) => {
      io.to(socketId).emit(eventName, data);
    });
  }
};