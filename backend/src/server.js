import express from 'express';
import dotenv from "dotenv";
import path from 'path';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import cors from "cors";
import { ENV } from './lib/env.js';
import { app, server } from "./lib/socket.js";

dotenv.config();

const __dirname = path.resolve();
const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Production single-server deployment CORS fix
app.use(cors({
  origin: ENV.NODE_ENV === "production" ? true : ENV.CLIENT_URL,
  credentials: true
}));

app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Static files deployment setup for Render
if (ENV.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "frontend", "dist");

  app.use(express.static(frontendDistPath));

  app.get("*", (_, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

server.listen(PORT, () => {
  console.log('Server is running on port: ' + PORT);
  connectDB();
});