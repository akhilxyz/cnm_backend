// events.ts
import { logger } from "@/server";
import { EventEmitter } from "events";

export const notificationEmitter = new EventEmitter();

// Listen for emitted notifications
export function setupNotificationListener() {
  const { io, socket_users } = require("../index"); // or use proper import path
  
  notificationEmitter.on("send_notification", async ({ userId, data }) => {    
    if (userId) {
      const targetSocket = socket_users[userId];
      console.log("targetSocket", targetSocket)
      if (targetSocket) {
        io.to(targetSocket).emit("private_message", data);
        logger.info(`[Socket] Notification sent to user ${userId}`);
      } else {
        logger.warn(`[Socket] User ${userId} not connected`);
      }
    } else {
      io.emit("private_message", data);
      logger.info(`[Socket] Broadcast notification`);
    }
  });
}