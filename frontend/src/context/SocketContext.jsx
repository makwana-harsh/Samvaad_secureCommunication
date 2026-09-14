import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, accessToken } = useAuth();

    useEffect(() => {
        if (user && accessToken) {
            const newSocket = io("http://localhost:3000", {
                auth: { token: accessToken },
                autoConnect: true,
                reconnection: true,
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } 
        else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user, accessToken]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);