import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (socket && socket.connected) return socket;
    socket = io(SOCKET_URL, {
        transports: ["websocket"],
        withCredentials: true,
    });
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
