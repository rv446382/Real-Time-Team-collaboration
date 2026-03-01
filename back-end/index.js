import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { connect } from "./Configs/db.js";

import userRouter from "./Routes/AuthRoutes.js";
import projectRouter from "./Routes/ProjectRoutes.js";
import taskRouter from "./Routes/TaskRoutes.js";
import teamRouter from "./Routes/TeamRoute.js";
import chatRouter from "./Routes/ChatRoute.js";

import Chat from "./Models/Chat.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Database connect
connect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", userRouter);
app.use("/api/project", projectRouter);
app.use("/api/task", taskRouter);
app.use("/api/team", teamRouter);
app.use("/api/chat", chatRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setup", (userId) => {
    socket.join(userId);
    console.log("User joined private room:", userId);
  });

  socket.on("joinChat", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log(`Socket joined project room: ${projectId}`);
  });

  socket.on("joinTeam", (teamId) => {
    socket.join(teamId);
    console.log(`Socket joined team room: ${teamId}`);
  });

  socket.on(
    "sendMessage",
    async ({ projectId, teamId, receiverId, message, senderId }) => {
      try {
        const msgData = {
          content: message,
          sender: senderId,
          projectId,
          teamId,
          receiverId,
        };

        const savedMessage = await Chat.create(msgData);
        const populated = await savedMessage.populate("sender", "name email");

        const responseData = {
          _id: populated._id,
          sender: {
            _id: populated.sender._id,
            name: populated.sender.name,
          },
          content: populated.content,
          projectId,
          teamId,
          receiverId,
          timestamp: populated.timestamp,
        };

        if (receiverId) {
          io.to(receiverId).to(senderId).emit("receiveMessage", responseData);
        } else {
          const room = projectId || teamId;
          io.to(room).emit("receiveMessage", responseData);
        }
      } catch (err) {
        console.error("Socket sendMessage error:", err);
      }
    }
  );

  socket.on("disconnect", () => console.log("User disconnected:"));
});

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}!!`);
});