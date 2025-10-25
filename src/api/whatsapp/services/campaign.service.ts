import { WhatsAppService } from "@/services/whatsapp.service";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";
import cron from "node-cron";
import { ContactRepository } from "../repositories/contact.repository";
import { WhatsAppAccountRepository } from "../repositories/whatsAppAccount.repository";
import { CampaignRepository } from "../repositories/campaign.repository";

export class CampaignService {
  private accountRepository: WhatsAppAccountRepository;
  private campaignRepository: CampaignRepository;
  private contactRepository: ContactRepository;

  constructor(
    accountRepository = new WhatsAppAccountRepository(),
    campaignRepository = new CampaignRepository(),
    contactRepository = new ContactRepository()
  ) {
    this.accountRepository = accountRepository;
    this.campaignRepository = campaignRepository;
    this.contactRepository = contactRepository;

    // Initialize scheduler
    this.initializeScheduler();
  }

  // Initialize cron job to check for scheduled campaigns
  private initializeScheduler() {
    // Check every minute for scheduled campaigns
    cron.schedule("*/30 * * * * *", async () => {
      try {
        const scheduledCampaigns = await this.campaignRepository.findScheduledCampaigns();
        
        for (const campaign of scheduledCampaigns) {
          const _campaign = campaign.dataValues
          if (new Date(_campaign.scheduledAt!) <= new Date()) {
            logger.info(`Starting scheduled campaign: ${_campaign?.id}`);
            await this.executeCampaign(_campaign);
          }
        }
      } catch (error) {
        logger.error(`Scheduler error: ${(error as Error).message}`);
      }
    });
  }

  // Create Campaign
  async createCampaign(userId: number, payload: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      // Validate contacts exist
      const contacts = await this.contactRepository.findByIdsAsync(payload.contactIds);
      if (contacts.length !== payload.contactIds.length) {
        return ServiceResponse.failure("Some contacts not found", null, StatusCodes.BAD_REQUEST);
      }

      const campaignData = {
        whatsappAccountId: account.id,
        title: payload.title,
        templateName: payload.templateName,
        languageCode: payload.languageCode || 'en_US',
        templateMeta: payload.templateMeta,
        components: payload.components,
        contactIds: payload.contactIds,
        contactCount: payload.contactIds.length,
        status: payload.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: payload.scheduledAt || null,
        createdBy: userId,
      };

      const campaign = await this.campaignRepository.createAsync(campaignData);

      // Create campaign logs for all contacts
      await this.createCampaignLogs(campaign.id, contacts);

      return ServiceResponse.success("Campaign created successfully", campaign, StatusCodes.CREATED);
    } catch (ex) {
      logger.error(`Error creating campaign: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to create campaign",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Create campaign logs for tracking
  private async createCampaignLogs(campaignId: number, contacts: any[]) {
    const logs = contacts.map(contact => ({
      campaignId,
      contactId: contact.id,
      phoneNumber: contact.phoneNumber,
      status: 'pending'
    }));

    await this.campaignRepository.createLogsAsync(logs);
  }

  // Get Campaigns
  async getCampaigns(
    userId: number,
    page: number,
    limit: number,
    status?: string
  ): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const filters: any = { whatsappAccountId: account.id };
      if (status) {
        filters.status = status;
      }

      const campaigns = await this.campaignRepository.findAllAsync(page, limit, filters);

      return ServiceResponse.success("Campaigns retrieved successfully", campaigns, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error fetching campaigns: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to fetch campaigns",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get Campaign Details
  async getCampaignDetails(userId: number, campaignId: number): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const campaign = await this.campaignRepository.findByIdAsync(campaignId);
      if (!campaign || campaign.whatsappAccountId !== account.id) {
        return ServiceResponse.failure("Campaign not found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("Campaign details retrieved", campaign, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error fetching campaign details: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to fetch campaign details",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Update Campaign
  async updateCampaign(userId: number, campaignId: number, payload: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const campaign = await this.campaignRepository.findByIdAsync(campaignId);
      if (!campaign || campaign.whatsappAccountId !== account.id) {
        return ServiceResponse.failure("Campaign not found", null, StatusCodes.NOT_FOUND);
      }

      // Can't update running or completed campaigns
      if (['running', 'completed'].includes(campaign.status)) {
        return ServiceResponse.failure(
          "Cannot update running or completed campaigns",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      // If contactIds are updated, validate and update count
      if (payload.contactIds) {
        const contacts = await this.contactRepository.findByIdsAsync(payload.contactIds);
        if (contacts.length !== payload.contactIds.length) {
          return ServiceResponse.failure("Some contacts not found", null, StatusCodes.BAD_REQUEST);
        }
        payload.contactCount = payload.contactIds.length;

        // Recreate campaign logs
        await this.campaignRepository.deleteLogsAsync(campaignId);
        await this.createCampaignLogs(campaignId, contacts);
      }

      const updated = await this.campaignRepository.updateAsync(campaignId, payload);

      return ServiceResponse.success("Campaign updated successfully", updated, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error updating campaign: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to update campaign",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Delete Campaign
  async deleteCampaign(userId: number, campaignId: number): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const campaign = await this.campaignRepository.findByIdAsync(campaignId);
      if (!campaign || campaign.whatsappAccountId !== account.id) {
        return ServiceResponse.failure("Campaign not found", null, StatusCodes.NOT_FOUND);
      }

      // Can't delete running campaigns
      if (campaign.status === 'running') {
        return ServiceResponse.failure(
          "Cannot delete running campaign. Please pause it first.",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      await this.campaignRepository.deleteAsync(campaignId);

      return ServiceResponse.success("Campaign deleted successfully", null, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error deleting campaign: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to delete campaign",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Send Campaign Immediately
  async sendCampaign(userId: number, campaignId: number): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const campaign = await this.campaignRepository.findByIdAsync(campaignId);
      if (!campaign || campaign.whatsappAccountId !== account.id) {
        return ServiceResponse.failure("Campaign not found", null, StatusCodes.NOT_FOUND);
      }

      if (campaign.status === 'running') {
        return ServiceResponse.failure("Campaign is already running", null, StatusCodes.BAD_REQUEST);
      }

      if (campaign.status === 'completed') {
        return ServiceResponse.failure("Campaign already completed", null, StatusCodes.BAD_REQUEST);
      }

      // Execute campaign asynchronously
      this.executeCampaign(campaign).catch(err => {
        logger.error(`Campaign execution error: ${err.message}`);
      });

      return ServiceResponse.success("Campaign started successfully", null, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error sending campaign: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to send campaign",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Execute Campaign (send messages)
  private async executeCampaign(campaign: any) {
    try {
      // Update status to running
      logger.info("running campaign")
      console.log("campaignxxx", campaign)
      await this.campaignRepository.updateAsync(campaign.id, {
        status: 'running',
        startedAt: new Date(),
      });

      const account = await this.accountRepository.findByIdAsync(campaign.whatsappAccountId);
        console.log("accountxxx", account)

      if (!account) {
        throw new Error("WhatsApp account not found");
      }

      const whatsapp = new WhatsAppService({
        phoneNumberId: account.phoneNumberId,
        accessToken: account.appToken,
        apiVersion: "v18.0",
      });

      // Get pending logs
      const logs = await this.campaignRepository.getPendingLogsAsync(campaign.id);

      let successCount = 0;
      let failureCount = 0;

      // Send messages with rate limiting (e.g., 1 message per second)
      for (const log of logs) {
        try {
          const response = await whatsapp.sendTemplateMessage({
            to: log.dataValues.phoneNumber,
            templateName: campaign.templateName,
            languageCode: campaign.languageCode,
            components: campaign.components,
          });

          await this.campaignRepository.updateLogAsync(log.dataValues.id, {
            status: 'sent',
            messageId: response.messages?.[0]?.id,
            sentAt: new Date(),
          });

          successCount++;
        } catch (error: any) {
          await this.campaignRepository.updateLogAsync(log.dataValues.id, {
            status: 'failed',
            errorMessage: error.message,
          });

          failureCount++;
        }

        // Rate limiting: wait 1 second between messages
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update campaign status
      await this.campaignRepository.updateAsync(campaign.id, {
        status: 'completed',
        completedAt: new Date(),
        messagesSent: successCount,
        messagesFailed: failureCount,
      });

      logger.info(`Campaign ${campaign.id} completed: ${successCount} sent, ${failureCount} failed`);
    } catch (error) {
      logger.error(`Campaign execution failed: ${(error as Error).message}`);
      
      await this.campaignRepository.updateAsync(campaign.id, {
        status: 'failed',
      });
    }
  }

  // Schedule Campaign
  async scheduleCampaign(
    userId: number,
    campaignId: number,
    scheduledAt: string
  ): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const campaign = await this.campaignRepository.findByIdAsync(campaignId);
      if (!campaign || campaign.whatsappAccountId !== account.id) {
        return ServiceResponse.failure("Campaign not found", null, StatusCodes.NOT_FOUND);
      }

      const scheduleDate = new Date(scheduledAt);
      if (scheduleDate <= new Date()) {
        return ServiceResponse.failure(
          "Scheduled time must be in the future",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const updated = await this.campaignRepository.updateAsync(campaignId, {
        scheduledAt: scheduleDate,
        status: 'scheduled',
      });

      return ServiceResponse.success("Campaign scheduled successfully", updated, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error scheduling campaign: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to schedule campaign",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Pause Campaign
  async pauseCampaign(userId: number, campaignId: number): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const campaign = await this.campaignRepository.findByIdAsync(campaignId);
      if (!campaign || campaign.whatsappAccountId !== account.id) {
        return ServiceResponse.failure("Campaign not found", null, StatusCodes.NOT_FOUND);
      }

      if (campaign.status !== 'running') {
        return ServiceResponse.failure("Only running campaigns can be paused", null, StatusCodes.BAD_REQUEST);
      }

      const updated = await this.campaignRepository.updateAsync(campaignId, {
        status: 'paused',
      });

      return ServiceResponse.success("Campaign paused successfully", updated, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error pausing campaign: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to pause campaign",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Resume Campaign
  async resumeCampaign(userId: number, campaignId: number): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const campaign = await this.campaignRepository.findByIdAsync(campaignId);
      if (!campaign || campaign.whatsappAccountId !== account.id) {
        return ServiceResponse.failure("Campaign not found", null, StatusCodes.NOT_FOUND);
      }

      if (campaign.status !== 'paused') {
        return ServiceResponse.failure("Only paused campaigns can be resumed", null, StatusCodes.BAD_REQUEST);
      }

      // Resume campaign execution
      this.executeCampaign(campaign).catch(err => {
        logger.error(`Campaign resume error: ${err.message}`);
      });

      return ServiceResponse.success("Campaign resumed successfully", null, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error resuming campaign: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to resume campaign",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get Campaign Logs
  async getCampaignLogs(
    userId: number,
    campaignId: number,
    page: number,
    limit: number
  ): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const campaign = await this.campaignRepository.findByIdAsync(campaignId);
      console.log("ampaign || campaign.whatsappAccountId !== account.id", campaign , campaign.whatsappAccountId , account.id)
      if (!campaign || campaign.whatsappAccountId !== account.id) {
        return ServiceResponse.failure("Campaign not found", null, StatusCodes.NOT_FOUND);
      }

      const logs = await this.campaignRepository.getLogsAsync(campaignId, page, limit);

      return ServiceResponse.success("Campaign logs retrieved", logs, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error fetching campaign logs: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to fetch campaign logs",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get Campaign Stats
  async getCampaignStats(userId: number, campaignId: number): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepository.findByUserIdAsync(userId);
      if (!account) {
        return ServiceResponse.failure("WhatsApp account not found", null, StatusCodes.NOT_FOUND);
      }

      const campaign = await this.campaignRepository.findByIdAsync(campaignId);
      if (!campaign || campaign.whatsappAccountId !== account.id) {
        return ServiceResponse.failure("Campaign not found", null, StatusCodes.NOT_FOUND);
      }

      const stats = await this.campaignRepository.getStatsAsync(campaignId);

      const statsData = {
        campaignId: campaign.id,
        title: campaign.title,
        status: campaign.status,
        contactCount: campaign.contactCount,
        messagesSent: campaign.messagesSent,
        messagesFailed: campaign.messagesFailed,
        pending: stats.pending || 0,
        delivered: stats.delivered || 0,
        read: stats.read || 0,
        successRate: campaign.contactCount > 0 
          ? ((campaign.messagesSent / campaign.contactCount) * 100).toFixed(2) 
          : 0,
        scheduledAt: campaign.scheduledAt,
        startedAt: campaign.startedAt,
        completedAt: campaign.completedAt,
      };

      return ServiceResponse.success("Campaign stats retrieved", statsData, StatusCodes.OK);
    } catch (ex) {
      logger.error(`Error fetching campaign stats: ${(ex as Error).message}`);
      return ServiceResponse.failure(
        "Failed to fetch campaign stats",
        (ex as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}