import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ENV.NODE_ENV === "production" ? true : [ENV.CLIENT_URL, "http://localhost:5173"],
        credentials: true,
    },
    pingTimeout: 10000,
    pingInterval: 5000,
    transports: ["websocket", "polling"],
});

io.use(socketAuthMiddleware);

const userSocketMap = {}; 

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

io.on("connection", (socket) => {
    console.log("A user connected:", socket.user?.fullName);

    const userId = socket.userId;
    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.user?.fullName);
        if (userId) delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };