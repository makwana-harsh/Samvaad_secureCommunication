import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import '../styles/HeaderComponent.style.css';

function HeaderComponent() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout(); // Clears user & accessToken in AuthContext
            navigate("/login", { replace: true });
        } 
        catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="app-header">
            {/* 1. App Logo */}
            <div className="header-logo" onClick={() => navigate("/home")}>
                <span className="header-logo-symbol">💬</span>
                <span className="header-logo-text">Samvaad</span>
            </div>

            {/* 2. Navigation Bar */}
            <nav className="header-nav">
            
                <NavLink to="/home" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} >
                    Home
                </NavLink>
                
                <NavLink to="/conversations" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} >
                    Conversations
                </NavLink>
                
                <NavLink to="/discover" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} >
                    Discover
                </NavLink>
            
            </nav>

            {/* 3. Logout Section */}
            <div className="header-actions">
                <button className="logout-btn" onClick={handleLogout}> Logout </button>
            </div>
        </header>
    );
}

export default HeaderComponent;