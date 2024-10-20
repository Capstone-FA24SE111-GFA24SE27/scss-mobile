import React, { createContext, useEffect, useRef, useContext } from "react";
import io from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { userData, isLogin } = useContext(AuthContext);
    const socket = useRef(null);

    useEffect(() => {
        if (userData?.id) {
            connectSocketIO(userData.id);
        }
        if(isLogin === false && socket){
            socket?.current?.disconnect();
        }

        return () => {
            if (socket?.current) {
                socket?.current?.disconnect();
            }
        };
    }, [userData, isLogin]);

    const connectSocketIO = (accountId) => {
        socket.current = io(`http://localhost:4000`);

        socket.current.on("connect", () => {
            console.log("Socket.IO connection established");
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






























