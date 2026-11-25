import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Home, LogOut, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import "../styles/HeaderComponent.style.css";

const LINKS = [
    { to: "/home", label: "Home", Icon: Home },
    { to: "/conversations", label: "Conversations", Icon: MessageCircle },
    { to: "/discover", label: "Discover", Icon: Compass },
];

function HeaderComponent() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="app-header">
            <div className="header-logo" onClick={() => navigate("/home")}>
                <span className="header-logo-mark"><MessageCircle size={18} strokeWidth={2.4} /></span>
                <span className="header-logo-text">Samvaad</span>
            </div>

            <nav className="header-nav">
                {LINKS.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to} className="nav-link">
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.span
                                        layoutId="nav-pill"
                                        className="nav-pill"
                                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                    />
                                )}
                                <Icon size={16} />
                                <span className="nav-label">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="header-actions">
                <ThemeToggle />
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span className="logout-label">Logout</span>
                </button>
            </div>
        </header>
    );
}

export default HeaderComponent;
