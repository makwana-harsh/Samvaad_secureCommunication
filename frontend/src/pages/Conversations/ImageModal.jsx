import React from "react";
import "../../styles/ImageModal.style.css";

function ImageModal({ src, alt, onClose }) {
  if (!src) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>
          ✕
        </button>
        <img src={src} alt={alt || "Preview"} className="full-size-image" />
      </div>
    </div>
  );
}

export default ImageModal;