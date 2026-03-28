import type * as React from "react";
import { env } from "@/env";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@repo/api/ws-share";
import { io, Socket } from "socket.io-client";

// Set up the context type for ease of reuse
type SocketContextType = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  loading: boolean;
  isConnected: boolean;
  refetch: () => Promise<any>;
  logout: () => Promise<void>;
};

export const SocketContext = createContext<SocketContextType>(null as any);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<PropsWithChildren<{}>> = props => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Replace with env or config as needed
  const SOCKET_URL = env.VITE_SOCKET_URL;

  // Socket connect & lifecycle
  useEffect(() => {
    setLoading(true);
    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      // Add authentication token or options as required, e.g:
      // auth: { token: userToken }
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setLoading(false);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", reason => {
      console.log("Socket disconnected:", reason);
      setLoading(true);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", error => {
      console.error("Socket connection error:", error);
      setLoading(false);
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SOCKET_URL]);

  // A simple refetch just reconnects the socket
  const refetch = useCallback(async () => {
    if (socket) {
      socket.connect();
    }
  }, [socket]);

  // Logout could disconnect socket/additional cleaning
  const logout = useCallback(async () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setLoading(true);
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{ socket, loading, isConnected, refetch, logout }}
    >
      {props.children}
    </SocketContext.Provider>
  );
};
