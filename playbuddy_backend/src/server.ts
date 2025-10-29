import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";

import { connectToDb } from "./libs/connectToDb";
import { initializeSocket } from "./libs/socket";
import authRoutes from "./routes/auth.route";
import directChatRoutes from "./routes/directChat.route";
import friendRequestRoutes from "./routes/friendRequest.route";
import friendshipRoutes from "./routes/friendship.route";
import groupChatRoutes from "./routes/groupChat.route";
import groupInvitationRoutes from "./routes/groupInvitation.route";
import locationRoutes from "./routes/location.route";
import notificationRoutes from "./routes/notification.route";
import sportTypeRoutes from "./routes/sportType.route";
import userRoutes from "./routes/user.route";
import "./libs/cron/deactivatedUsersCheck";

dotenv.config();
const PORT = process.env.PORT;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/sportTypes", sportTypeRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/groupChats", groupChatRoutes);
app.use("/api/directChats", directChatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friendRequests", friendRequestRoutes);
app.use("/api/groupInvitations", groupInvitationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/friendships", friendshipRoutes);

initializeSocket(io);

server.listen(PORT, () => {
  connectToDb();

  console.log(`Server is running on port ${PORT}`);
});
