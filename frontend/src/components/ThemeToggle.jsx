import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import useTheme from "../hooks/useTheme";

export default function ThemeToggle({ className = "" }) {
    const { theme, toggle } = useTheme();
    const dark = theme === "dark";
    const label = dark ? "Switch to light theme" : "Switch to dark theme";

    return (
        <button
            type="button"
            className={`theme-toggle ${className}`}
            onClick={toggle}
            aria-label={label}
            title={label}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={theme}
                    style={{ display: "grid" }}
                    initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                >
                    {dark ? <Sun size={18} /> : <Moon size={18} />}
                </motion.span>
            </AnimatePresence>
        </button>
    );
}
