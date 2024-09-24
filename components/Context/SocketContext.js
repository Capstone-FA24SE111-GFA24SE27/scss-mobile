import React, { createContext, useEffect, useRef, useContext } from "react";
import io from "socket.io-client";
import { AuthContext } from "./AuthContext"; // Sử dụng AuthContext để lấy thông tin người dùng

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { userData } = useContext(AuthContext); // Lấy thông tin người dùng từ AuthContext
    const socket = useRef(null);

    useEffect(() => {
        if (userData?.accountId) {
            connectSocketIO(userData.accountId);
        }

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [userData]);

    const connectSocketIO = (accountId) => {
        socket.current = io(`http://localhost:3000`, {
            transports: ["websocket"],
        });

        socket.current.on("connect", () => {
            console.log("Socket.IO connection established");
            socket.current.emit("subscribe", {
                topic: `/user/${accountId}/private/notification`,
            });
        });

        socket.current.on("connect_error", (err) => {
            console.error("Socket.IO connection error:", err.message);
        });

        socket.current.on("disconnect", (reason) => {
            console.log("Socket.IO disconnected:", reason);
        });
    };

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    );
};
