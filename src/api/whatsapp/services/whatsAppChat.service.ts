// src/services/whatsapp.chat.service.ts
import { StatusCodes } from "http-status-codes";
import { WhatsAppChatRepository } from "../repositories/whatsAppChat.repository";
import { WhatsAppAccountRepository } from "../repositories/whatsAppAccount.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { ContactRepository } from "../repositories/contact.repository";
import { notificationEmitter } from "@/services/events.service";
import { NotificationRepository } from "@/api/notification/notification.repository";
import { NewLeadRepository } from "../repositories/newLead.repository";
// import { socket_users } from "@/services/socket.service";
// import { io } from "@/index";

const chatRepository = new WhatsAppChatRepository();
const accountRepository = new WhatsAppAccountRepository();
const contactRepository = new ContactRepository();
const newLeadRepo = new NewLeadRepository()
export class WhatsAppChatService {
  /**
   * Handle incoming webhook messages
   */
  /* async handleWebhook(payload: any): Promise<ServiceResponse<any>> {
    try {
      // The webhook payload contains an array of entries

      const entries = payload.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field === "messages") {
            const value = change.value;
            const whatsappAccountPhoneId = value.metadata.phone_number_id;

            // Find the WhatsApp account in DB
            const account = await accountRepository.findByPhoneNumberIdAsync(whatsappAccountPhoneId);
            if (!account) {
              logger.warn(`Invalid WhatsApp account for phone_number_id: ${whatsappAccountPhoneId}`);
              continue;
            }

            const whatsappAccountId = account.id;

            const contacts = value.contacts || [];
            const messages = value.messages || [];

            for (const message of messages) {
              const contactInfo = contacts.find((c: any) => c.wa_id === message.from);
              if (!contactInfo) continue;

              const PhoneNumber = message.from || 0; // Assuming you map contacts in DB

              const findContact: any = await contactRepository.findByPhoneNumberAsync(account.id, PhoneNumber)
              if (!findContact) {
                logger.info(`[Webhook] New lead detected for phone: ${PhoneNumber}`);

                await new NewLeadRepository().createAsync({
                  whatsappAccountId,
                  phoneNumber: PhoneNumber,
                  wa_id: contactInfo.wa_id,
                  name: contactInfo.profile?.name || "Unknown User",
                  messageType: message.type,
                  message: message?.text?.body || null,
                  mediaUrl:
                    message?.image?.url ||
                    message?.video?.url ||
                    message?.audio?.url ||
                    message?.sticker?.url ||
                    null,
                });

                logger.info(`[Webhook] Saved new lead: ${PhoneNumber}`);
                continue; // stop further chat creation since it's not a known contact
              }
              const messageId = message.id;

              // Check if message already exists
              const existing = await chatRepository.findByMessageIdAsync(messageId);
              if (existing) continue;

              const content = message.type === "text" ? message.text.body : null;

              const chat = await chatRepository.createAsync({
                whatsappAccountId,
                contactId: findContact.id,
                messageId,
                direction: "inbound", // webhook messages are always inbound
                messageType: message.type,
                content: content,
                mediaUrl: message?.image?.url || message?.video?.url || message?.audio?.url || message?.sticker?.url || null,
                mediaId: message?.image?.id || message?.video?.id || message?.audio?.id || message?.sticker?.id || null,
                mimeType: message?.image?.mime_type || message?.video?.mime_type || message?.audio?.mime_type || message?.sticker?.mime_type || null,
                caption: message?.image?.caption || message?.video?.caption || null,
                fileName: message?.document?.filename || null,
                fileSize: message?.document?.file_size || null,
                status: "received",
                metadata: value.metadata,
                timestamp: new Date(parseInt(message.timestamp) * 1000),
              });

              const title = `📩 New WhatsApp message from ${findContact?.name ?? 'User'}`;

              const notify: any = await new NotificationRepository().createAsync({
                whatsappAccountId,
                contactId: findContact.id,
                title: title,
                message: content ?? message.type + ' received'
              });
              if (notify?.id) {
                logger.info("[notificationEmitter] notification recevied")
                const receiverAccount = await accountRepository.findByIdAsync(whatsappAccountId)
                // Emit notification via EventEmitter instead of direct io.emit
                notificationEmitter.emit("send_notification", {
                  userId: receiverAccount.id, // or null for broadcast
                  data: chat,
                });
              }
              logger.info("[Webhhook] notification saved")
            }
          }
        }
      }

      return ServiceResponse.success("Webhook processed successfully", null, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Webhook message error: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to process webhook message",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  } */


    async handleWebhook(payload: any): Promise<ServiceResponse<any>> {
  try {
    const entries = payload?.entry ?? [];
    if (!Array.isArray(entries) || entries.length === 0) {
      logger.warn("[Webhook] Empty or invalid entries received");
      return ServiceResponse.success("No entries to process", null, StatusCodes.OK);
    }

    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      if (!Array.isArray(changes)) continue;

      for (const change of changes) {
        if (change?.field !== "messages") continue;

        const value = change?.value;
        const whatsappAccountPhoneId = value?.metadata?.phone_number_id;
        if (!whatsappAccountPhoneId) {
          logger.warn("[Webhook] Missing phone_number_id in metadata");
          continue;
        }

        const account = await accountRepository.findByPhoneNumberIdAsync(whatsappAccountPhoneId);
        if (!account) {
          logger.warn(`Invalid WhatsApp account for phone_number_id: ${whatsappAccountPhoneId}`);
          continue;
        }

        const whatsappAccountId = account.id;
        const contacts = value?.contacts ?? [];
        const messages = value?.messages ?? [];

        for (const message of messages) {
          if (!message?.from || !message?.id) continue;

          const contactInfo = contacts.find((c: any) => c?.wa_id === message.from);
          const phoneNumber = message.from;

          // Find or create contact
          let contact = await contactRepository.findByPhoneNumberAsync(whatsappAccountId, phoneNumber);
          if (!contact) {
            logger.info(`[Webhook] New lead detected for phone: ${phoneNumber}`);

            const newContactPayload = {
              whatsappAccountId,
              name: contactInfo?.profile?.name || "Unknown User",
              phoneNumber: (phoneNumber)?.toString(),
              countryCode: "+91",
              status: "ACTIVE",
            };

            console.log("newContactPayload", newContactPayload)
            
            contact = await contactRepository.createAsync(newContactPayload);

            await new NewLeadRepository().createAsync({
              whatsappAccountId,
              phoneNumber,
              wa_id: contactInfo?.wa_id ?? null,
              name: contactInfo?.profile?.name || "Unknown User",
              messageType: message?.type ?? "unknown",
              message: message?.text?.body ?? null,
              mediaUrl:
                message?.image?.url ||
                message?.video?.url ||
                message?.audio?.url ||
                message?.sticker?.url ||
                null,
            });

            logger.info(`[Webhook] Saved new lead: ${phoneNumber}`);
          }

          // Skip duplicate messages
          const messageId = message.id;
          const existing = await chatRepository.findByMessageIdAsync(messageId);
          if (existing) continue;

          // Prepare message content safely
          const content = message?.type === "text" ? message?.text?.body ?? null : null;
          const mediaUrl =
            message?.image?.url ||
            message?.video?.url ||
            message?.audio?.url ||
            message?.sticker?.url ||
            null;
          const mediaId =
            message?.image?.id ||
            message?.video?.id ||
            message?.audio?.id ||
            message?.sticker?.id ||
            null;
          const mimeType =
            message?.image?.mime_type ||
            message?.video?.mime_type ||
            message?.audio?.mime_type ||
            message?.sticker?.mime_type ||
            null;
          const caption = message?.image?.caption || message?.video?.caption || null;

          const chat = await chatRepository.createAsync({
            whatsappAccountId,
            contactId: contact.id,
            messageId,
            direction: "inbound",
            messageType: message?.type ?? "unknown",
            content,
            mediaUrl,
            mediaId,
            mimeType,
            caption,
            fileName: message?.document?.filename ?? null,
            fileSize: message?.document?.file_size ?? null,
            status: "received",
            metadata: value?.metadata ?? {},
            timestamp: message?.timestamp
              ? new Date(parseInt(message.timestamp) * 1000)
              : new Date(),
          });

          // Create notification
          const title = `📩 New WhatsApp message from ${contact?.name ?? "User"}`;
          const notify = await new NotificationRepository().createAsync({
            whatsappAccountId,
            contactId: contact.id,
            title,
            message: content ?? `${message?.type ?? "unknown"} received`,
          });

          if (notify?.id) {
            logger.info("[notificationEmitter] notification received");
            const receiverAccount = await accountRepository.findByIdAsync(whatsappAccountId);
            notificationEmitter.emit("send_notification", {
              userId: receiverAccount?.id ?? null,
              data: chat,
            });
          }

          logger.info(`[Webhook] Processed message ID: ${messageId}`);
        }
      }
    }

    return ServiceResponse.success("Webhook processed successfully", null, StatusCodes.OK);
  } catch (ex) {
    logger.error(`[Webhook] Error: ${(ex as Error).message}`);
    return ServiceResponse.failure(
      "Failed to process webhook message",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}


  /**
   * Send outbound message (text only for now)
   */
  async sendMessage(userId: number, payload: any): Promise<ServiceResponse<any>> {
    try {
      const account = await accountRepository.findByUserIdAsync(userId);
      if (!account)
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

      // TODO: call Meta WhatsApp Cloud API or Twilio here to send the message
      // Simulated response:
      const messageId = `msg_${Date.now()}`;

      const saved = await chatRepository.createAsync({
        whatsappAccountId: account.id,
        contactId: payload.contactId,
        messageId,
        direction: "outbound",
        messageType: payload.messageType || "text",
        content: payload.content,
        status: "sent",
        timestamp: new Date(),
      });

      return ServiceResponse.success("Message sent successfully", saved, StatusCodes.CREATED);
    } catch (ex) {
      logger.error(`Send message error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to send message", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get chat history with a contact
   */
  async getChatHistory(userId: number, contactId: number, page = 1, limit = 50) {
    const response = await chatRepository.findByContactAsync(contactId, page, limit);
    return ServiceResponse.success("chat history fetch successfully", response, StatusCodes.CREATED);

  }

  /**
   * Get all conversations (list of contacts + last message)
   */
  async getConversations(userId: number) {
    const account = await accountRepository.findByUserIdAsync(userId);
    if (!account) {
      return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
    }
    const response = await chatRepository.findConversationsAsync(account.id);
    return ServiceResponse.success("chat conversations fetch successfully", response, StatusCodes.CREATED);

  }

  async getNewLeads(
    userId: number,
    page = 1,
    limit = 50,
    search?: string,
    startDate?: string,
    endDate?: string,
    sort: "ASC" | "DESC" = "DESC"
  ): Promise<ServiceResponse<any>> {
    try {
      // 🔹 Optional: Validate WhatsApp account for user (security check)
      const account = await accountRepository.findByUserIdAsync(userId);
      if (!account)
        return ServiceResponse.failure(
          "Access denied",
          null,
          StatusCodes.FORBIDDEN
        );

      // 🔹 Fetch new leads with filters
      const result = await newLeadRepo.getFilteredAsync({
        page,
        limit,
        search,
        startDate,
        endDate,
        sort,
      });

      return ServiceResponse.success(
        "New leads fetched successfully",
        result,
        StatusCodes.OK
      );
    } catch (ex) {
      logger.error(`Get new leads error: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to fetch new leads",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(whatsappAccountId: number, contactId: number) {
    const count = await chatRepository.getUnreadCountAsync(whatsappAccountId, contactId);
    return ServiceResponse.success("Unread count fetched", { count }, StatusCodes.OK);
  }

  /**
   * Get unread message count
   */
  async getUnreadCountAll(userId: number) {
    const account = await accountRepository.findByUserIdAsync(userId);
    if (!account)
      return ServiceResponse.failure(
        "Access denied",
        null,
        StatusCodes.FORBIDDEN
      );
      console.log("account", account)
    const count = await chatRepository.getUnreadCountAllAsync(account.id);
    return ServiceResponse.success("Unread count fetched", { count }, StatusCodes.OK);
  }

  /**
   * Mark messages as read
   */
  async markAsRead(contactId: number) {
    await chatRepository.markAsReadAsync(contactId);
    return ServiceResponse.success("Messages marked as read", null, StatusCodes.OK);
  }
}
