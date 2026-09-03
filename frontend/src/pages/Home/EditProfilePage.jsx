import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getUserProfileFunct,
  updateUserProfileFunct,
} from "../../api/home.api";

import { useAuth } from "../../context/AuthContext";
import defaultAvatar from "../../assets/default_avatar.avif";

import "../../styles/EditProfilePage.style.css";

// ----------------------------------------------------------------------
// CONSTANTS & HELPERS
// ----------------------------------------------------------------------

const MAX_AVATAR_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB limit for profile picture
const BIO_MAX_LENGTH = 700;

const INITIAL_FORM_STATE = {
  fullName: "",
  userName: "",
  emailId: "",
  mobileNo: "",
  bio: "",
  location: "",
  dob: "",
  avatar: null,
};

const formatProfileData = (userData) => ({
  fullName: userData?.fullName || "",
  userName: userData?.userName || "",
  emailId: userData?.emailId || "",
  mobileNo: userData?.mobileNo || "",
  bio: userData?.bio || "",
  location: userData?.location || "",
  dob: userData?.dob
    ? new Date(userData.dob).toISOString().split("T")[0]
    : "",
  avatar: userData?.avatar || null,
});

// ----------------------------------------------------------------------
// COMPONENT IMPLEMENTATION
// ----------------------------------------------------------------------

function EditProfilePage({ isEditMode = false }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Async States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Data & Error States
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [initialData, setInitialData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  // Avatar / Preview States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(defaultAvatar);
  const [showImageModal, setShowImageModal] = useState(false);

  // --------------------------------------------------------------------
  // PROFILE FETCHING
  // --------------------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfileFunct();
        const userData = response?.user || response;

        if (!isMounted) return;

        const formattedData = formatProfileData(userData);
        setFormData(formattedData);
        setInitialData(formattedData);
        setPreviewAvatar(formattedData.avatar || defaultAvatar);
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------
  // VALIDATION LOGIC
  // --------------------------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    // Full Name Validation (Mirrors Register Zod Rule)
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }

    // Mobile Number Validation (Mirrors Register Zod Rule)
    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required";
    } else if (formData.mobileNo.trim().length < 10) {
      newErrors.mobileNo = "Mobile number must be at least 10 digits";
    }

    // Bio Character Limit Validation
    if (formData.bio && formData.bio.length > BIO_MAX_LENGTH) {
      newErrors.bio = `Bio cannot exceed ${BIO_MAX_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------

  const isDirty =
    JSON.stringify(formData) !== JSON.stringify(initialData) ||
    selectedFile !== null;

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Clear error for field as soon as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // 15 MB Profile Picture Limit
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      alert("Profile image size must be less than 15 MB.");
      event.target.value = ""; 
      return;
    }

    if (previewAvatar?.startsWith("blob:")) {
      URL.revokeObjectURL(previewAvatar);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewAvatar(previewUrl);
  };

  const handleCancel = () => {
    if (previewAvatar?.startsWith("blob:")) {
      URL.revokeObjectURL(previewAvatar);
    }

    setFormData(initialData);
    setSelectedFile(null);
    setErrors({});
    setPreviewAvatar(initialData.avatar || defaultAvatar);

    navigate("/home/profile");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isDirty || saving) return;

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("fullName", formData.fullName.trim());
      payload.append("mobileNo", formData.mobileNo.trim());
      payload.append("bio", formData.bio.trim());
      payload.append("location", formData.location.trim());
      payload.append("dob", formData.dob);

      if (selectedFile) {
        payload.append("avatar", selectedFile);
      }

      const response = await updateUserProfileFunct(payload);
      const updatedUser = response?.user || response;

      if (setUser) {
        setUser(updatedUser);
      }

      const updatedFormData = formatProfileData(updatedUser);
      setFormData(updatedFormData);
      setInitialData(updatedFormData);
      setSelectedFile(null);
      setErrors({});
      setPreviewAvatar(updatedFormData.avatar || defaultAvatar);

      navigate("/home/profile");
    } catch (error) {
      console.error("Profile update failed:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-loading">
        Loading profile details...
      </div>
    );
  }

  return (
    <div className="edit-profile-page-fullscreen">
      <div className="edit-page-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/home")}
        >
          &larr; Back
        </button>

        <h2>{isEditMode ? "Edit Profile" : "Profile"}</h2>

        {!isEditMode && (
          <button
            type="button"
            className="top-edit-btn"
            onClick={() => navigate("/home/profile/edit")}
          >
            Edit
          </button>
        )}
      </div>

      <div className="edit-profile-content">
        {/* Avatar Section */}
        <div className="avatar-wrapper">
          <img
            src={previewAvatar || defaultAvatar}
            alt="Profile Avatar"
            className="big-profile-avatar"
            onClick={() => setShowImageModal(true)}
          />

          {isEditMode && (
            <label
              className="avatar-upload-badge"
              htmlFor="avatar-input"
              title="Change Avatar (Max 15 MB)"
            >
              📷
              <input
                type="file"
                id="avatar-input"
                name="avatar"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>

        {/* Form Section */}
        <form className="profile-form" onSubmit={handleSave}>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={!isEditMode || saving}
            />
            {errors.fullName && (
              <span className="error-text" style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "4px" }}>
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Username (Non-editable) */}
          <div className="form-group">
            <label htmlFor="userName">
              Username <span className="read-only-tag">(Non-editable)</span>
            </label>
            <input
              id="userName"
              type="text"
              name="userName"
              value={formData.userName}
              disabled
            />
          </div>

          {/* Email (Non-editable) */}
          <div className="form-group">
            <label htmlFor="emailId">
              Email ID <span className="read-only-tag">(Non-editable)</span>
            </label>
            <input
              id="emailId"
              type="email"
              name="emailId"
              value={formData.emailId}
              disabled
            />
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label htmlFor="mobileNo">Mobile Number</label>
            <input
              id="mobileNo"
              type="text"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleInputChange}
              disabled={!isEditMode || saving}
            />
            {errors.mobileNo && (
              <span className="error-text" style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "4px" }}>
                {errors.mobileNo}
              </span>
            )}
          </div>

          {/* Bio with Character Count */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="bio">Bio</label>
              {isEditMode && (
                <span style={{ fontSize: "0.8rem", color: formData.bio.length > BIO_MAX_LENGTH ? "#e74c3c" : "#888" }}>
                  {formData.bio ? formData.bio.length : 0} / {BIO_MAX_LENGTH}
                </span>
              )}
            </div>
            <textarea
              id="bio"
              name="bio"
              /* Removed maxLength so users can type further and trigger the error */
              value={formData.bio}
              onChange={handleInputChange}
              placeholder={
                !isEditMode && !formData.bio
                  ? "No bio added yet"
                  : "Write something about yourself..."
              }
              disabled={!isEditMode || saving}
            />
            {errors.bio && (
              <span className="error-text" style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "4px" }}>
                {errors.bio}
              </span>
            )}
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder={
                !isEditMode && !formData.location
                  ? "Not specified"
                  : "e.g., Mumbai, India"
              }
              disabled={!isEditMode || saving}
            />
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              id="dob"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              disabled={!isEditMode || saving}
            />
          </div>

          {/* Actions */}
          {isEditMode && (
            <div className="edit-form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={!isDirty || saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div
          className="image-modal-backdrop"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="image-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowImageModal(false)}
            >
              &times;
            </button>
            <img
              src={previewAvatar || defaultAvatar}
              alt="Enlarged Profile"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfilePage;