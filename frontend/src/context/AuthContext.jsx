import { createContext, useContext, useState, useEffect, useRef } from "react";
import api, { setupInterceptors } from "../api/axios";
import { loginUserFunct, refreshAccessTokenFunct, logoutUserFunct } from "../api/auth.api";

const AuthContext = createContext();

// Cross-tab synchronization channel
const authChannel = new BroadcastChannel("auth_channel");

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ref avoids stale closure issue when interceptors read accessToken
    const tokenRef = useRef(accessToken);
    useEffect(() => {
        tokenRef.current = accessToken;
    }, [accessToken]);

    const getAccessToken = () => tokenRef.current;

    // 1. FIX: Async logout that clears backend HTTP-only cookies & notifies other tabs
    const logout = async () => {
        try {
            await logoutUserFunct(); // Invalidate refreshToken cookie on server
        } catch (error) {
            console.error("Backend logout error:", error);
        } finally {
            setAccessToken(null);
            setUser(null);
            authChannel.postMessage({ type: "LOGOUT" }); // Notify other tabs
        }
    };

    useEffect(() => {
        // Setup interceptors with cleanup
        const cleanupInterceptors = setupInterceptors(getAccessToken, setAccessToken, logout);

        // Silent refresh on browser reload
        const initializeAuth = async () => {
            try {
                const data = await refreshAccessTokenFunct();
                setAccessToken(data.accessToken);
                if (data.user) {
                    setUser(data.user); // Re-hydrates user state on browser refresh
                }
            } 
            catch (err) {
                setAccessToken(null);
                setUser(null);
            } 
            finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // 2. FIX: Listen for events from other browser tabs
        const handleAuthBroadcast = (event) => {
            if (event.data?.type === "LOGOUT") {
                setAccessToken(null);
                setUser(null);
            } else if (event.data?.type === "LOGIN") {
                initializeAuth();
            }
        };

        authChannel.addEventListener("message", handleAuthBroadcast);

        return () => {
            cleanupInterceptors();
            authChannel.removeEventListener("message", handleAuthBroadcast);
        };
    }, []);

    const login = async (credentials) => {
        const data = await loginUserFunct(credentials);
        setAccessToken(data.accessToken);
        setUser(data.user);
        authChannel.postMessage({ type: "LOGIN" }); // Broadcast login to other tabs
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);