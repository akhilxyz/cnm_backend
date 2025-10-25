
import { logger } from "@/server";
import { io } from "..";






// Keep track of connected users
export const socket_users: Record<string, string> = {};

// When frontend connects
io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  // Register user (optional if you want per-user notifications)
  socket.on("connect-me", (userId: string) => {
    socket_users[userId] = socket.id;
    logger.info("connected user", userId) 
  });

   // Send private message
  socket.on("private_message", ({ toUserId, message }: { toUserId: string, message: string }) => {
    const targetSocket = socket_users[toUserId];
    if (targetSocket) {
      io.to(targetSocket).emit("private_message", { from: socket.id, message });
      logger.info(`Message from ${socket.id} to ${toUserId}: ${message}`);
    }
  });

  socket.on("disconnect", () => {
    for (const userId in socket_users) {
      if (socket_users[userId] === socket.id) {
        delete socket_users[userId];
        break;
      }
    }
  });
});

// Function to send notification to frontend
export const sendNotification = (userId: string | null, data: any) => {
  if (userId) {
    const targetSocket = socket_users[userId];
    if (targetSocket) {
      io.to(targetSocket).emit("notification", data);
    }
  } else {
    // broadcast to all
    io.emit("notification", data);
  }
};
