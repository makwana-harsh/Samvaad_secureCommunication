import multer from "multer";

const storage = multer.memoryStorage();

// 1. General Multer instance for large files (videos, audio, documents in chat)
export const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB limit
    },
});

// 2. Strict Multer instance for Profile Avatars
export const uploadAvatar = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed for profile avatar!"), false);
        }
    },
});