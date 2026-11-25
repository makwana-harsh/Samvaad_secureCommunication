import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, MessageCircle, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import "../../styles/Auth/Auth.style.css";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [userData, setUserData] = useState({ userName: "", userPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setUserData((prevData) => ({ ...prevData, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setBusy(true);
            await login(userData);
            alert("Login successful!");
            navigate("/home");
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        } finally {
            setBusy(false);
        }
        setUserData({ userName: "", userPassword: "" });
    }

    return (
        <div className="auth-shell">
            <ThemeToggle className="floating" />

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="auth-brand"><MessageCircle size={24} strokeWidth={2.4} /></div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-sub">Log in to continue your conversations.</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label htmlFor="userName">Username</label>
                        <div className="auth-input">
                            <User size={17} />
                            <input id="userName" type="text" name="userName" required autoComplete="username"
                                placeholder="Enter username" value={userData.userName} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="userPassword">Password</label>
                        <div className="auth-input">
                            <Lock size={17} />
                            <input id="userPassword" type={showPassword ? "text" : "password"} name="userPassword" required
                                autoComplete="current-password" placeholder="Enter password"
                                value={userData.userPassword} onChange={handleChange} />
                            <button type="button" className="auth-eye" onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </div>

                    <motion.button type="submit" className="pill-btn auth-submit" disabled={busy} whileTap={{ scale: 0.98 }}>
                        {busy ? "Signing in..." : "Login"}
                    </motion.button>
                </form>

                <p className="auth-switch">
                    New here? <button type="button" className="auth-link" onClick={() => navigate("/register")}>Create an account</button>
                </p>
            </motion.div>
        </div>
    );
}

export default LoginPage;
