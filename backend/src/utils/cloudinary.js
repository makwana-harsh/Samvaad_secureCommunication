import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const uploadStreamHelper = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(stream);
  });
};

/*
 * USER AVATAR
 *
 * Cloudinary:
 * Samvaad_Project/users/<userId>
 */
export const uploadUserAvatar = async (fileBuffer, userId) => {
  return uploadStreamHelper(fileBuffer, {
    folder: "Samvaad_Project/users",
    public_id: userId.toString(),
    overwrite: true,
    invalidate: true,
    resource_type: "image",
  });
};

/*
 * GROUP AVATAR
 *
 * Cloudinary:
 * Samvaad_Project/groups/<groupId>
 */
export const uploadGroupAvatar = async (fileBuffer, groupId) => {
  return uploadStreamHelper(fileBuffer, {
    folder: "Samvaad_Project/groups",
    public_id: groupId.toString(),
    overwrite: true,
    invalidate: true,
    resource_type: "image",
  });
};

/*
 * CHAT ATTACHMENT
 *
 * Cloudinary:
 * Samvaad_Project/messages/<conversationId>/<messageId>
 */
export const uploadChatMessageAttachment = async (
  fileBuffer,
  conversationId,
  messageId,
  mimeType,
  originalName
) => {
  let resourceType = "auto";

  if (
    mimeType.startsWith("application/") ||
    mimeType.startsWith("text/")
  ) {
    resourceType = "raw";
  }

  const options = {
    folder: `Samvaad_Project/messages/${conversationId}`,
    public_id: messageId.toString(),
    resource_type: resourceType,
  };

  /*
   * Tell Cloudinary the filename that should be used
   * when the resource is downloaded.
   */
  if (originalName) {
    options.filename_override = originalName;
  }

  return uploadStreamHelper(fileBuffer, options);
};

/*
 * Delete one Cloudinary resource.
 */
export const deleteChatMessageAttachment = async (
  publicId,
  resourceType = "image"
) => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
};

export const generateChatAttachmentPreview = (publicId,resourceType) => {
  if (!publicId) return null;

  // Blurred lightweight image preview
  if (resourceType === "image") {
    return cloudinary.url(publicId, {
      resource_type: "image",
      transformation: [
        {
          width: 400,
          crop: "limit",
          quality: "auto:low",
          effect: "blur:800",
        },
      ],
      secure: true,
    });
  }

  // Thumbnail from video frame
  if (resourceType === "video") {
    return cloudinary.url(publicId, {
      resource_type: "video",
      format: "jpg",
      transformation: [
        {
          start_offset: "1",
          width: 500,
          crop: "limit",
          quality: "auto",
        },
      ],
      secure: true,
    });
  }

  return null;
};