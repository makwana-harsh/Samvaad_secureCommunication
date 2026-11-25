import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AtSign, Eye, EyeOff, Lock, Mail, MessageCircle, Phone, User } from "lucide-react";
import { registerUserFunct } from "../../api/auth.api";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import "../../styles/Auth/Auth.style.css";

const EMPTY = { fullName: "", userName: "", emailId: "", mobileNo: "", password: "" };

function RegisterPage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(EMPTY);
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
            const res = await registerUserFunct(userData);
            alert(res.message || "Registration successful!");
            navigate("/login");
        } catch (err) {
            console.log("Full Error Object:", err.response?.data);
            alert(
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.message ||
                "Registration failed"
            );
        } finally {
            setBusy(false);
        }
        setUserData(EMPTY);
    }

    const Field = ({ label, name, Icon, type = "text", placeholder, full, children }) => (
        <div className={`auth-field ${full ? "full" : ""}`}>
            <label htmlFor={name}>{label}</label>
            <div className="auth-input">
                <Icon size={17} />
                <input id={name} type={type} name={name} required placeholder={placeholder}
                    value={userData[name]} onChange={handleChange} />
                {children}
            </div>
        </div>
    );

    return (
        <div className="auth-shell">
            <ThemeToggle className="floating" />

            <motion.div
                className="auth-card wide"
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="auth-brand"><MessageCircle size={24} strokeWidth={2.4} /></div>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-sub">It takes less than a minute.</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-grid">
                        <Field label="Full name" name="fullName" Icon={User} placeholder="Enter full name" />
                        <Field label="Username" name="userName" Icon={AtSign} placeholder="Enter username" />
                        <Field label="Email" name="emailId" Icon={Mail} placeholder="Enter email id" />
                        <Field label="Mobile number" name="mobileNo" Icon={Phone} placeholder="Enter mobile number" />
                        <Field label="Password" name="password" Icon={Lock} full
                            type={showPassword ? "text" : "password"} placeholder="Create a password">
                            <button type="button" className="auth-eye" onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </Field>
                    </div>

                    <motion.button type="submit" className="pill-btn auth-submit" disabled={busy} whileTap={{ scale: 0.98 }}>
                        {busy ? "Creating account..." : "Register"}
                    </motion.button>
                </form>

                <p className="auth-switch">
                    Already have an account? <button type="button" className="auth-link" onClick={() => navigate("/login")}>Login</button>
                </p>
            </motion.div>
        </div>
    );
}

export default RegisterPage;
