import { getMessagesService, sendMessageService,sendAttachmentService } from "./message.service.js";
import Message from "../../models/Message.model.js";
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 30, 1), 100);

        const result = await getMessagesService({
            userId,
            conversationId: req.params.conversationId,
            page,
            limit,
        });

        res.status(200).json({
            success: true,
            data: result.messages,
            pagination: result.pagination,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to load messages",
        });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const message = await sendMessageService({
            userId,
            conversationId: req.params.conversationId,
            content: req.body.content,
        });

        res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to send message",
        });
    }
};

export const sendAttachment = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File is required",
            });
        }

        const message = await sendAttachmentService({
            userId,
            conversationId: req.params.conversationId,
            file: req.file,
        });

        return res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to send attachment",
        });
    }
};

export const downloadAttachment = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message || message.messageType === "text") {
            return res.status(404).json({
                success: false,
                message: "Attachment not found",
            });
        }

        const response = await fetch(message.content);

        if (!response.ok) {
            throw new Error("Failed to fetch attachment");
        }

        // if (!response.ok) {
        //     console.error(
        //         "CLOUDINARY FETCH FAILED:",
        //         response.status,
        //         response.statusText,
        //         message.content,
        //         message.cloudinaryResourceType
        //     );

        //     throw new Error(
        //         `Failed to fetch attachment: ${response.status}`
        //     );
        // }

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(
                message.originalFileName || "attachment"
            )}"`
        );

        res.setHeader(
            "Content-Type",
            message.mimeType || "application/octet-stream"
        );

        const buffer = Buffer.from(await response.arrayBuffer());
        return res.send(buffer);

    } catch (error) {
        // console.error("DOWNLOAD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Download failed",
        });
    }
};