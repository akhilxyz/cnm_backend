import express, { type Router } from "express";
import { notificationController } from "./notification.controller";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authenticateToken } from "@/common/middleware/auth";
import { CreateNotificationSchema } from "./notification.schema";

export const notificationRouter: Router = express.Router();


// Create notification
notificationRouter.post(
  "/create",
  authenticateToken,
  validateRequest(CreateNotificationSchema),
  notificationController.create
);

// Fetch recent notifications
notificationRouter.get(
  "/recent",
  authenticateToken,
  notificationController.findRecent
);

// Mark notification as read
notificationRouter.patch(
  "/:id/read",
  authenticateToken,
  notificationController.markAsRead
);