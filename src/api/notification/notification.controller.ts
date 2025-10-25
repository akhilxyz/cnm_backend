import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { NotificationService } from "@/api/notification/notification.service";

const notificationService = new NotificationService();

class NotificationController {
  /**
   * Create a new notification
   */
  public create: RequestHandler = async (req: Request, res: Response) => {
    const { whatsappAccountId, contactId, title, message } = req.body;

    const serviceResponse = await notificationService.create({
      whatsappAccountId,
      contactId,
      title,
      message,
    });

    return handleServiceResponse(serviceResponse, res);
  };

  /**
   * Fetch recent notifications
   */
  public findRecent: RequestHandler = async (req: Request, res: Response) => {
    const whatsappAccountId = Number(req.query.whatsappAccountId);
    const limit = Number(req.query.limit) || 5;

    const serviceResponse = await notificationService.findRecent(whatsappAccountId, limit);

    return handleServiceResponse(serviceResponse, res);
  };

  /**
   * Mark a notification as read
   */
  public markAsRead: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;

    const serviceResponse = await notificationService.markAsRead(id);

    return handleServiceResponse(serviceResponse, res);
  };
}

export const notificationController = new NotificationController();
