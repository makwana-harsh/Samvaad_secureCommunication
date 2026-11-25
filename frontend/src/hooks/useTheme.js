import { useCallback, useEffect, useState } from "react";

const KEY = "samvaad-theme";

const readTheme = () => {
    const attr = document.documentElement.dataset.theme;
    if (attr === "dark" || attr === "light") return attr;
    try {
        return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
    } catch {
        return "light";
    }
};

export default function useTheme() {
    const [theme, setTheme] = useState(readTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
    }, [theme]);

    const toggle = useCallback(() => {
        const root = document.documentElement;
        root.classList.add("theme-anim");
        setTimeout(() => root.classList.remove("theme-anim"), 450);
        setTheme((t) => (t === "dark" ? "light" : "dark"));
    }, []);

    return { theme, toggle };
}
