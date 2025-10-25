
import { WhatsAppService } from "@/services/whatsapp.service";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";
import { WhatsAppAccountRepository } from "../repositories/whatsAppAccount.repository";
import { WhatsAppGroupRepository } from "../repositories/whatsappGroup.repository";

export class WhatsAppGroupService {
  private accountRepository: WhatsAppAccountRepository;
  private groupRepository: WhatsAppGroupRepository;

  constructor(
    accountRepository = new WhatsAppAccountRepository(),
    groupRepository = new WhatsAppGroupRepository()
  ) {
    this.accountRepository = accountRepository;
    this.groupRepository = groupRepository;
  }

  // Create Group
  async createGroup(userId: number, payload: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v24.0",
      });

      // Create group via Meta API
      const groupResponse :any  = await whatsapp.createGroup({
        subject: payload.subject,
        description : payload.description,
        participants : payload.participants
      });

      // Save to database
      const groupData = {
        whatsappAccountId: account.id,
        groupId: groupResponse.groups[0].group_id,
        groupName: payload.subject,
        participants: payload.participants,
        createdBy: userId,
      };

      const savedGroup = await this.groupRepository.createAsync(groupData);

      return ServiceResponse.success("Group created successfully", savedGroup, StatusCodes.CREATED);
    } catch (ex :any) {
      console.log("ER=>>>>>>", ex?.response)
         if (ex.error?.code === 10) {
        /* throw new Error({
          message : 
          "Missing permissions. Please ensure your app has 'whatsapp_business_management' permission enabled."
        }); */
         return ServiceResponse.failure(
        "Missing permissions. Please ensure your app has 'whatsapp_business_management' permission enabled.",
        "Missing permissions. Please ensure your app has 'whatsapp_business_management' permission enabled.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
         }

      logger.error(`Error creating group: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to create group",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Update Group
  async updateGroup(userId: number, groupId: string, payload: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const group = await this.groupRepository.findByGroupIdAsync(groupId);
      if (!group) {
        return ServiceResponse.failure("Group not found", null, StatusCodes.NOT_FOUND);
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v18.0",
      });

      // Update via Meta API
      await whatsapp.updateGroup(groupId, payload);

      // Update in database
      const updated = await this.groupRepository.updateAsync(group.id, payload);

      return ServiceResponse.success("Group updated successfully", updated, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error updating group: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to update group",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Delete Group
  async deleteGroup(userId: number, groupId: string): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const group = await this.groupRepository.findByGroupIdAsync(groupId);
      if (!group) {
        return ServiceResponse.failure("Group not found", null, StatusCodes.NOT_FOUND);
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v18.0",
      });

      // Leave group via Meta API (admin must leave last)
      await whatsapp.leaveGroup(groupId);

      // Mark as deleted in database
      await this.groupRepository.deleteAsync(group.id);

      return ServiceResponse.success("Group deleted successfully", null, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error deleting group: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to delete group",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get Groups List
  async getGroups(userId: number, page: number, limit: number): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const groups = await this.groupRepository.findAllAsync(account.id, page, limit);

      return ServiceResponse.success("Groups retrieved successfully", groups, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error fetching groups: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to fetch groups",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get Group Details
  async getGroupDetails(userId: number, groupId: string): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v18.0",
      });

      const groupInfo = await whatsapp.getGroupInfo(groupId);

      return ServiceResponse.success("Group details retrieved", groupInfo, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error fetching group details: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to fetch group details",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Add Members
  async addMembers(userId: number, groupId: string, payload: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v18.0",
      });

      const response = await whatsapp.addGroupParticipants(groupId, payload.participants);

      return ServiceResponse.success("Members added successfully", response, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error adding members: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to add members",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Remove Member
  async removeMember(userId: number, groupId: string, phoneNumber: string): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v18.0",
      });

      await whatsapp.removeGroupParticipant(groupId, phoneNumber);

      return ServiceResponse.success("Member removed successfully", null, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error removing member: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to remove member",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Update Admins
  async updateAdmins(userId: number, groupId: string, payload: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v18.0",
      });

      const response = await whatsapp.updateGroupAdmin(groupId, payload.phoneNumber, payload.action);

      return ServiceResponse.success("Admin updated successfully", response, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error updating admin: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to update admin",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Update Settings
  async updateSettings(userId: number, groupId: string, payload: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v18.0",
      });

      await whatsapp.updateGroupSettings(groupId, payload);

      return ServiceResponse.success("Settings updated successfully", null, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error updating settings: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to update settings",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Update Group Icon
  async updateGroupIcon(userId: number, groupId: string, file: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v18.0",
      });

      // Upload media first
      const mediaResponse  :any = await whatsapp.uploadMedia(file);
      
      // Update group icon
      await whatsapp.updateGroupIcon(groupId, mediaResponse?.id || mediaResponse);

      return ServiceResponse.success("Group icon updated successfully", null, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error updating group icon: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to update group icon",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Send Group Message
  async sendGroupMessage(userId: number, groupId: string, payload: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v18.0",
      });

      const response = await whatsapp.sendGroupMessage({
        groupId: groupId,
        type: payload.messageType || "text",
        content: payload.content,
        mediaId: payload.mediaId,
        caption: payload.caption,
        fileName: payload.fileName,
      });

      return ServiceResponse.success("Message sent successfully", response, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error sending group message: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to send message",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get Group Chat History
  async getGroupChatHistory(
    userId: number,
    groupId: string,
    page: number,
    limit: number
  ): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const history = await this.groupRepository.getChatHistoryAsync(groupId, page, limit);

      return ServiceResponse.success("Chat history retrieved", history, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error fetching chat history: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to fetch chat history",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}