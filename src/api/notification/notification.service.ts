import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { NotificationRepository } from "./notification.repository";
import { logger } from "@/server";
import { WhatsAppAccountRepository } from "../whatsapp/repositories/whatsAppAccount.repository";


const accountRepository = new WhatsAppAccountRepository();


export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor(repository: NotificationRepository = new NotificationRepository()) {
    this.notificationRepository = repository;
  }

  /**
   * Fetch recent notifications for a WhatsApp account
   */
  async findRecent(userID: number, limit: number = 10): Promise<ServiceResponse<any>> {
    try {
      const WAAccount= await accountRepository.findByUserIdAsync(userID)

      if(!WAAccount) {
        return ServiceResponse.success('Notifications fetched successfully', []);
      }

      const notifications = await this.notificationRepository.findRecentAsync(WAAccount.id, limit);

      return ServiceResponse.success('Notifications fetched successfully', notifications);
    } catch (ex) {
      const errorMessage = `Error fetching notifications: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while fetching notifications.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<ServiceResponse<any>> {
    try {
      const result = await this.notificationRepository.markAsReadAsync(id);
      if (!result || result[0] === 0) {
        return ServiceResponse.failure('Notification not found', null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success('Notification marked as read', result);
    } catch (ex) {
      const errorMessage = `Error marking notification as read: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while updating the notification.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create a new notification
   */
  async create(data: {
    whatsappAccountId: number;
    contactId: number;
    title: string;
    message: string;
  }): Promise<ServiceResponse<any>> {
    try {
      const notification = await this.notificationRepository.createAsync(data);
      return ServiceResponse.success('Notification created successfully', notification, StatusCodes.CREATED);
    } catch (ex) {
      const errorMessage = `Error creating notification: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while creating notification.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
