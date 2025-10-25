// server.ts
import { app, logger } from "@/server";
import { createServer } from "http";
import { env } from "@/common/utils/envConfig";
import { syncDB } from "./db/config";
// server.ts
import { Server as SocketServer } from "socket.io";
import { setupNotificationListener } from "./services/events.service";

export const httpServer = createServer(app);

// Start server
const server = httpServer.listen(env.PORT, () => {
  const { NODE_ENV, HOST, PORT } = env;
  logger.info(`Server (${NODE_ENV}) running on http://${HOST}:${PORT}`);
});

// Graceful shutdown
const onCloseSignal = () => {
  logger.info("SIGINT/SIGTERM received, shutting down");
  server.close(() => {
    logger.info("Server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

// Sync DB
syncDB()
  .then(() => logger.info(`Server Database synced`))
  .catch((err) => console.error("DB connection error:", err));



export const io = new SocketServer(httpServer, {
  cors: {
    origin: "*", // frontend
    methods: ["GET", "POST"],
  },
});
export const socket_users: Record<string, string> = {};

io.on("connection", (socket) => {
  // Optional: handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
  socket.on("connect-me", (userId: string) => {
    socket_users[userId] = socket.id;
    logger.info(`connected user ${userId}`)
  });
});

setupNotificationListener();

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);

