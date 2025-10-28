import { StatusCodes } from "http-status-codes";
import { WhatsAppAccountRepository } from "@/api/whatsapp/repositories/whatsAppAccount.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { WhatsAppService } from "@/services/whatsapp.service";
import { ContactRepository } from "../repositories/contact.repository";

export class WhatsAppAccountService {
  private repository: WhatsAppAccountRepository;
  private contactRepository: ContactRepository;

  constructor(repository: WhatsAppAccountRepository = new WhatsAppAccountRepository(),
    contactRepository = new ContactRepository()
  ) {
    this.repository = repository;
    this.contactRepository = contactRepository
  }

  // ✅ Create WhatsApp account
  async createOrUpdateAccount(userId: number, payload: any): Promise<ServiceResponse<any>> {
  try {
    const existing = await this.repository.findByPhoneNumberAsync(payload.phone_number);

    const data: any = {
      userId,
      phoneNumber: payload.phone_number,
      displayName: payload.display_name,
      businessName: payload.business_name,
      phoneNumberId: payload.phone_number_id,
      businessAccountId: payload.business_account_id,
      apiKey: payload.api_key,
      appToken: payload.token,
      status: "active",
    };

    if (existing) {
      // Update existing record
      await this.repository.updateAsync(existing.id, data);
      return ServiceResponse.success(
        "WhatsApp account updated successfully",
        null,
        StatusCodes.OK
      );
    } else {
      // Create new record
      await this.repository.createAsync(data);
      return ServiceResponse.success(
        "WhatsApp account created successfully",
        null,
        StatusCodes.CREATED
      );
    }
  } catch (ex) {
    logger.error(`Error creating/updating WhatsApp account: ${(ex as Error).message}`);
    return ServiceResponse.failure(
      "Failed to create or update WhatsApp account",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}



  async sendMessage(userId: number, payload: any): Promise<ServiceResponse<any>> {
    try {
      const findUser = await this.repository.findByUserIdAsync(userId);
      if (!findUser) {
        return ServiceResponse.failure("Account not found", null, StatusCodes.NOT_FOUND);
      }

      // ✅ Use the correct token from DB
      const whatsapp = new WhatsAppService({
        phoneNumberId: findUser.phoneNumberId,
        accessToken: findUser.appToken, // ✅ use apiKey, not webhookVerifyToken
        apiVersion: 'v18.0'
      });

      const contactInfo = await this.contactRepository.findByIdAsync(payload?.contactId)

      if (!contactInfo) {
        return ServiceResponse.failure("Contact not found", null, StatusCodes.NOT_FOUND);
      }

      // ✅ Dynamically support both template + text
      /* const resp = await whatsapp.sendTextMessage({
        to: contactInfo.phoneNumber,
        type: payload.messageType || 'text',
        text: payload.content || 'Hello! This is a test message.',
        previewUrl: payload.previewUrl || false,
        templateName: payload.templateName,
        languageCode: payload.languageCode,
        components: payload.components
      });
 */

      const resp = await whatsapp.sendMessage({
  to: contactInfo.phoneNumber,
  type: payload.messageType || 'text',
  text: payload.content,
  // mediaUrl: payload.mediaUrl,
  mediaId: payload.mediaId,
  caption: payload.caption,
  fileName: payload.fileName,
  templateName: payload.templateName,
  languageCode: payload.languageCode,
  components: payload.components,
});
      await this.repository.createAsync({
        whatsappAccountId: findUser.id,
        contactId: payload?.contactId,
        messageId: resp.messages?.[0]?.id || `msg_${Date.now()}`,
        direction: 'outbound',
        messageType: payload.messageType || 'text',
        content: payload?.content || null,
        mediaUrl: payload?.mediaUrl || null,
        mediaId: payload?.mediaId || null,
        mimeType: payload?.mimeType || null,
        caption: payload?.caption || null,
        fileName: payload?.fileName || null,
        fileSize: payload?.fileSize || null,
        status: 'sent',
        metadata: resp || null,
        timestamp: new Date(),
      });

      return ServiceResponse.success("Message sent successfully", resp, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error sending WhatsApp message: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to send WhatsApp message",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }



  async sendMessageTemplate(userId: number, payload: any): Promise<ServiceResponse<any>> {
    try {
      const findUser = await this.repository.findByUserIdAsync(userId);
      if (!findUser) {
        return ServiceResponse.failure("Account not found", null, StatusCodes.NOT_FOUND);
      }

      // ✅ Use the correct token from DB
      const whatsapp = new WhatsAppService({
        phoneNumberId: findUser.phoneNumberId,
        accessToken: findUser.appToken, // ✅ use apiKey, not webhookVerifyToken
        apiVersion: 'v18.0'
      });

      const contactInfo = await this.contactRepository.findByIdAsync(payload?.contactId)

      if (!contactInfo) {
        return ServiceResponse.failure("Contact not found", null, StatusCodes.NOT_FOUND);
      }

      // ✅ Dynamically support both template + text
      const resp = await whatsapp.sendTextMessage({
        to: contactInfo.phoneNumber,//work
        type: 'template',
        text: payload.content || 'Hello! This is a test message.',
        previewUrl: payload.previewUrl || false,
        templateName: payload.templateName,
        languageCode: payload.languageCode,
        components: payload.components
      });

      console.log("payload.components:", JSON.stringify(payload, null, 2));

      // Original template text with placeholders
      const templateText = payload.templateMeta?.components?.find((c: any) => c.type === "BODY")?.text || "";

      // BODY parameters filled by user
      const bodyParameters = payload.components?.find((c: any) => c.type === "BODY")?.parameters || [];

      // Resolve placeholders
      let resolvedText = templateText;

      bodyParameters.forEach((p: any, index: number) => {
        if (p.type === "text") {
          const regex = new RegExp(`\\{\\{\\s*${index + 1}\\s*\\}\\}`, "g");
          resolvedText = resolvedText.replace(regex, p.text);
        }
      });

      await this.repository.createAsync({
        whatsappAccountId: findUser.id,
        contactId: payload?.contactId,
        messageId: resp.messages?.[0]?.id || `msg_${Date.now()}`,
        direction: 'outbound',
        messageType: payload.messageType || 'text',
        content:
          payload.messageType === 'template'
            ? resolvedText // ✅ resolved text
            : payload?.content || null,
        mediaUrl: payload?.mediaUrl || null,
        mediaId: payload?.mediaId || null,
        mimeType: payload?.mimeType || null,
        caption: payload?.caption || null,
        fileName: payload?.fileName || null,
        fileSize: payload?.fileSize || null,
        status: 'sent',
        metadata: resp || null,
        timestamp: new Date(),
      });


      return ServiceResponse.success("Message sent successfully", resp, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error sending WhatsApp message: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to send WhatsApp message",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }


  // ✅ Get all accounts for a user (or admin)
  async findAll(user: any, page = 1, limit = 10, status?: string): Promise<ServiceResponse<any>> {
    try {
      const filters: any = {};
      if (user.role !== "admin") filters.userId = user.id;
      if (status) filters.status = status;

      const accounts = await this.repository.findAllAsync(page, limit, filters);
      return ServiceResponse.success("Accounts retrieved successfully", accounts);
    } catch (ex) {
      logger.error(`Error fetching accounts: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to fetch accounts", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // ✅ Get single account
  async findById(user: any, id: number): Promise<ServiceResponse<any>> {
    try {
      const account = await this.repository.findByIdAsync(id, user.role !== "admin" ? user.id : undefined);
      if (!account) {
        return ServiceResponse.failure("Account not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Account found", account);
    } catch (ex) {
      logger.error(`Error fetching account: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to fetch account", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // ✅ Update account
  async updateAccount(user: any, id: number, payload: any): Promise<ServiceResponse<any>> {
    try {
      const updated = await this.repository.updateAsync(
        id,
        {
          displayName: payload.display_name,
          businessName: payload.business_name,
          profilePic: payload.profile_pic,
          webhookUrl: payload.webhook_url,
        },
        user.role !== "admin" ? user.id : undefined
      );

      if (!updated) {
        return ServiceResponse.failure("Account not found or update failed", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("Account updated successfully", updated);
    } catch (ex) {
      logger.error(`Error updating account: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to update account", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // ✅ Update account status
  async updateStatus(id: number, status: string): Promise<ServiceResponse<any>> {
    try {
      const validStatuses = ["active", "pending", "suspended", "disconnected"];
      if (!validStatuses.includes(status)) {
        return ServiceResponse.failure("Invalid status", null, StatusCodes.BAD_REQUEST);
      }

      await this.repository.updateStatusAsync(id, status);
      return ServiceResponse.success("Account status updated successfully", null);
    } catch (ex) {
      logger.error(`Error updating account status: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to update account status", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // ✅ Delete account
  async deleteAccount(user: any, id: number): Promise<ServiceResponse<any>> {
    try {
      const deleted = await this.repository.deleteAsync(id, user.role !== "admin" ? user.id : undefined);
      if (!deleted) {
        return ServiceResponse.failure("Account not found or access denied", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Account deleted successfully", null);
    } catch (ex) {
      logger.error(`Error deleting account: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to delete account", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async downloadMedia(userId: number, mediaId: string | null): Promise<ServiceResponse<any>> {
    try {

      if (!mediaId) {
        return ServiceResponse.failure("mediaId required", null, StatusCodes.NOT_FOUND);
      }
      const findUser = await this.repository.findByUserIdAsync(userId);
      if (!findUser) {
        return ServiceResponse.failure("Account not found", null, StatusCodes.NOT_FOUND);
      }
      // ✅ Use the correct token from DB
      const whatsapp = new WhatsAppService({
        phoneNumberId: findUser.phoneNumberId,
        accessToken: findUser.appToken, // ✅ use apiKey, not webhookVerifyToken
        apiVersion: 'v18.0'
      });
      // ✅ Dynamically support both template + text
      const mediaInfo: any = await whatsapp.getMediaUrl(mediaId);

      const mediaUrl = mediaInfo?.url;
      const mimeType = mediaInfo?.mime_type;

      if (!mediaUrl) {
        return ServiceResponse.failure("Media URL not found", null, StatusCodes.NOT_FOUND);
      }

      const response = await fetch(mediaUrl, {
        headers: {
          Authorization: `Bearer ${findUser.appToken}`,
        },
      });

      // Step 3: Convert response to buffer
      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Step 4: Convert to Base64
      const base64Data = buffer.toString("base64");
      return ServiceResponse.success(
        "Media downloaded successfully",
        {
          mimeType,
          base64: base64Data,
          downloadUrl: mediaUrl, // optional, valid for short time
        },
        StatusCodes.OK
      );


    } catch (ex) {
      logger.error(`Error downloading WhatsApp media: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to download WhatsApp media",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async uploadMedia(userId: number, file: any): Promise<ServiceResponse<any>> {
    try {
      const findUser = await this.repository.findByUserIdAsync(userId);
      if (!findUser) {
        return ServiceResponse.failure("Account not found", null, StatusCodes.NOT_FOUND);
      }
      const whatsapp = new WhatsAppService({
        phoneNumberId: findUser.phoneNumberId,
        accessToken: findUser.appToken,
      });

      const mediaInfo: any = await whatsapp.uploadMedia(file);

      return ServiceResponse.success(
        "Media uploaded successfully",
        mediaInfo,
        StatusCodes.OK
      );


    } catch (ex) {
      logger.error(`Error upload WhatsApp media: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to upload WhatsApp media",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }



  async createTemplate(userId: number, payload: any): Promise<ServiceResponse<any>> {
    try {

      const existing = await this.repository.findByUserIdAsync(userId);
      if (!existing) {
        return ServiceResponse.failure("Account not registered", null, StatusCodes.BAD_REQUEST);
      }

      // Use the correct token from DB
      const whatsapp = new WhatsAppService({
        phoneNumberId: existing.businessAccountId, //business_account_id for template
        accessToken: existing.appToken,
      });

      await whatsapp.createTemplate(payload)

      return ServiceResponse.success("templateList created successfully", null);
    } catch (ex) {
      logger.error(`Error created template: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to created template", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async templateList(userId: number): Promise<ServiceResponse<any>> {
    try {

      const existing = await this.repository.findByUserIdAsync(userId);
      if (!existing) {
        return ServiceResponse.failure("Account not registered", null, StatusCodes.BAD_REQUEST);
      }

      // Use the correct token from DB
      const whatsapp = new WhatsAppService({
        phoneNumberId: existing.businessAccountId, //business_account_id for template
        accessToken: existing.appToken,
      });

      const templateList = await whatsapp.fetchTemplates()


      return ServiceResponse.success("templateList fetch successfully", templateList);
    } catch (ex) {
      logger.error(`Error fetch templateList: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to fetch templateList", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
