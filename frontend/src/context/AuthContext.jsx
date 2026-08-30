import { createContext, useContext, useState, useEffect } from "react";
import api, { setupInterceptors } from "../api/axios";
import { loginUserFunct, refreshAccessTokenFunct } from "../api/auth.api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getAccessToken = () => accessToken;

    const logout = () => {
        setAccessToken(null);
        setUser(null);
    };

    useEffect(() => {
        // Bind interceptors to React state
        setupInterceptors(getAccessToken, setAccessToken, logout);

        // Silent refresh on browser reload
        const initializeAuth = async () => {
            try {
                const data = await refreshAccessTokenFunct();
                setAccessToken(data.accessToken);
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
    }, []);

    const login = async (credentials) => {
        const data = await loginUserFunct(credentials);
        setAccessToken(data.accessToken);
        setUser(data.user);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
        {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);