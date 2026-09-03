import Message from "../models/Message.model.js";
import {deleteChatMessageAttachment} from "../utils/cloudinary.js";

export const cleanupExpiredMessages = async () => {
    try {
        const now = new Date();

        const expiredMessages = await Message.find({
        expiresAt: {
            $ne: null,
            $lte: now,
        },
        }).limit(100);

        for (const message of expiredMessages) {
            try {
                /*
                * Delete Cloudinary media first.
                */
                if (
                message.cloudinaryPublicId &&
                message.cloudinaryResourceType
                ) {
                await deleteChatMessageAttachment(
                    message.cloudinaryPublicId,
                    message.cloudinaryResourceType
                );
                }

                /*
                * Then delete MongoDB message.
                */
                await Message.deleteOne({
                _id: message._id,
                });
            } 
            catch (error) {
                console.error(
                `Failed to clean message ${message._id}:`,
                error
                );
            }
        }
    } 
    catch (error) {
        console.error("Expired message cleanup failed:",error);
    }
};