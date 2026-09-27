import { useState } from "react";
import { downloadAttachmentApi } from "../api/conversation.api";
function MessageImage({ message }) {
    const [loaded, setLoaded] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDownload = async (e) => {
        e.stopPropagation();

        try {
            await downloadAttachmentApi(message);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    return (
        <>
            <div
                className="message-image-wrapper"
                onClick={() => setOpen(true)}
            >
                {message.thumbnailUrl && !loaded && (
                    <img
                        src={message.thumbnailUrl}
                        alt=""
                        className="message-image preview"
                    />
                )}

                <img
                    src={message.content}
                    alt={message.originalFileName || "Image"}
                    className={`message-image full ${loaded ? "loaded" : ""}`}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                />
            </div>

            {open && (
                <div
                    className="image-lightbox"
                    onClick={() => setOpen(false)}
                >
                    <button
                        className="image-lightbox-close"
                        onClick={() => setOpen(false)}
                    >
                        ×
                    </button>

                    <button
                        className="image-lightbox-download"
                        onClick={handleDownload}
                    >
                        ⬇ Download
                    </button>

                    <img
                        src={message.content}
                        alt={message.originalFileName || "Image"}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}

export default MessageImage;