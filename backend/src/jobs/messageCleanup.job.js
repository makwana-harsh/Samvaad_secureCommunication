import cron from "node-cron";
import { v2 as cloudinary } from "cloudinary";
import Message from "../models/Message.model.js";
import { deleteChatMessageAttachment } from "../utils/cloudinary.js";

/**
 * Core function: Batched, parallelized cleanup of expired messages, 
 * media assets, and empty Cloudinary conversation folders.
 */
export const cleanupExpiredMessages = async () => {
    try {
        const now = new Date();

        // 1. Fetch expired messages in controlled batches
        const expiredMessages = await Message.find({
            expiresAt: {
                $ne: null,
                $lte: now,
            },
        })
        .select("_id conversationId cloudinaryPublicId cloudinaryResourceType")
        .limit(200)
        .lean();

        if (expiredMessages.length === 0) return;

        console.log(`[Cleanup Job] Found ${expiredMessages.length} expired message(s). Processing...`);

        // Extract unique conversation IDs to check for empty folders later
        const affectedConversationIds = [
        ...new Set(expiredMessages.map((msg) => msg.conversationId?.toString()).filter(Boolean)),
        ];

        // 2. Filter messages that have Cloudinary attachments
        const mediaMessages = expiredMessages.filter(
            (msg) => msg.cloudinaryPublicId && msg.cloudinaryResourceType
        );

        // 3. Parallelize Cloudinary asset deletion
        if (mediaMessages.length > 0) {
            await Promise.allSettled(
                mediaMessages.map((msg) =>
                    deleteChatMessageAttachment(
                        msg.cloudinaryPublicId,
                        msg.cloudinaryResourceType
                    ).catch((err) =>
                        console.error(`[Cleanup Error] Asset deletion failed for ${msg.cloudinaryPublicId}:`, err.message)
                    )
                )
            );
        }

        // 4. Batch-delete MongoDB documents
        const idsToDelete = expiredMessages.map((msg) => msg._id);
        const deleteResult = await Message.deleteMany({ _id: { $in: idsToDelete } });

        console.log(`[Cleanup Job] Removed ${deleteResult.deletedCount} message document(s) from MongoDB.`);

        // 5. Clean up empty Cloudinary folders for affected conversations
        for (const convId of affectedConversationIds) {
            try {
                const folderPath = `Samvaad_Project/messages/${convId}`;
                
                // Check if remaining resources exist in the folder
                const resources = await cloudinary.api.resources({
                    type: "upload",
                    prefix: folderPath,
                    max_results: 1,
                });

                // If no files remain in the folder, delete it
                if (resources.resources.length === 0) {
                    await cloudinary.api.delete_folder(folderPath);
                    console.log(`[Cleanup Job] 📁 Deleted empty Cloudinary folder: ${folderPath}`);
                }
            } 
            catch (folderErr) {
                // Silently ignore if folder was already removed or didn't exist
            }
        }
    } 
    catch (error) {
        console.error("[Cleanup Job Fatal Error]:", error);
    }
};

/**
 * Registers the background cron job scheduler.
 */
export const initMessageCleanupScheduler = () => {
    // Cron syntax: "0 0 * * *" = Runs every day at Midnight (12:00 AM)
    cron.schedule("0 0 * * *", async () => {
        console.log("[Cleanup Job] 🕛 Midnight cleanup triggered...");
        await cleanupExpiredMessages();
    });

    console.log("🚀 Message Cleanup Scheduler initialized (Runs daily at Midnight 12:00 AM).");
};