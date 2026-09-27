import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserProfileFunct } from "../../api/home.api";
import "../../styles/Home/HomePage.style.css";

import OnlineFriendsContainer from "./OnlineFriendsContainer.jsx";
import RequestContainer from "./RequestContainer.jsx";
import RequestDetails from "./RequestDetails.jsx";
import defaultAvatar from "../../assets/default_avatar.avif";

function HomePage() {
    const { user,setUser } = useAuth();
    const navigate = useNavigate();

    const [selectedRequest, setSelectedRequest] = React.useState(null);

    const handleRequestRemoved = useCallback((requestId) => {
        setSelectedRequest((prev) =>
            prev?.requestId?.toString() === requestId?.toString()
                ? null
                : prev
        );
    }, []);

    useEffect(() => {
        let isMounted = true;
        const refreshUser = async () => {
            try {
                const response = await getUserProfileFunct();
                const freshUser = response?.user || response;
                if (isMounted && setUser) {
                    setUser(freshUser);
                }
            } catch (err) {
                console.error("Failed to sync home page profile:", err);
            }
        };

        refreshUser();

        return () => {
            isMounted = false;
        };
    }, []);

    // Append updated timestamp or fallback to avatar
    const userAvatarUrl = user?.avatar 
        ? `${user.avatar}?t=${new Date(user.updatedAt || Date.now()).getTime()}`
        : defaultAvatar;

    const handleEditClick = () => {
        navigate("profile/edit");
    };

    return (
        <div className="homepage-container">
            {/* Profile Section */}
            <div className="HomePage_profile_section clickable-card" onClick={() => navigate("/home/profile")} >
                <div className="profile-card">
                    <div className="profile-avatar-container">
                        {/* Use the dynamically versioned userAvatarUrl */}
                        <img 
                            src={userAvatarUrl} 
                            alt={user?.fullName || "User Avatar"} 
                            className="profile-avatar" 
                        />
                    </div>

                    <div className="profile-details">
                        <h2 className="profile-fullname">{user?.fullName || "User Name"}</h2>
                        <p className="profile-username">@{user?.userName || "username"}</p>
                        
                        <div className="profile-info-grid">
                            <span className="info-item">
                                <strong>Email:</strong> {user?.emailId || "N/A"}
                            </span>
                            <span className="info-item">
                                <strong>Mobile:</strong> {user?.mobileNo || "N/A"}
                            </span>
                        </div>
                    </div>

                    <div className="profile-action">
                        <span className="view-profile-hint">View Profile &rarr;</span>
                    </div>
                </div>
            </div>

            {/* End Section (Active Cards & Requests) */}
            <div className="HomePage_end_section">
                <OnlineFriendsContainer />
                <RequestContainer
                    onSelect={setSelectedRequest}
                    onRequestRemoved={handleRequestRemoved}
                />
            </div>
            
            {selectedRequest && (
                <RequestDetails
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            )}

        </div>
    );
}

export default HomePage;