import { ServiceResponse } from "@/common/models/serviceResponse";
import { BroadcastRepository } from "../repositories/broadcast.repository";
import { WhatsAppAccountRepository } from "../repositories/whatsAppAccount.repository";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";

export class BroadcastService {
  private repository = new BroadcastRepository();
  private accountRepo = new WhatsAppAccountRepository();

  private async verifyAccountAccess(accountId: number, user: any) {
    const account = await this.accountRepo.findByIdAsync(accountId, user.role === 'admin' ? undefined : user.id);
    if (!account) throw new Error('Access denied');
    return account;
  }

  async createBroadcast(user: any, data: any): Promise<ServiceResponse<any>> {
    try {
      await this.verifyAccountAccess(data.whatsappAccountId, user);

      // TODO: implement recipients selection here (similar to your raw query logic)
      const totalRecipients = 0;

      const broadcast = await this.repository.createAsync({
        ...data,
        status: data.scheduledAt ? 'scheduled' : 'draft',
        totalRecipients,
        createdBy: user.id
      });

      return ServiceResponse.success("Broadcast created successfully", broadcast);
    } catch (ex) {
      logger.error(`Create broadcast error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to create broadcast", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getBroadcasts(user: any, filters: any): Promise<ServiceResponse<any>> {
    try {
      await this.verifyAccountAccess(filters.whatsappAccountId, user);
      const result = await this.repository.findAllAsync(filters.whatsappAccountId, filters);
      return ServiceResponse.success("Broadcasts fetched successfully", result);
    } catch (ex) {
      logger.error(`Get broadcasts error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to fetch broadcasts", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getBroadcast(user: any, id: number): Promise<ServiceResponse<any>> {
    try {
      const broadcast = await this.repository.findByIdAsync(id);
      if (!broadcast) return ServiceResponse.failure("Broadcast not found", null, StatusCodes.NOT_FOUND);

      await this.verifyAccountAccess(broadcast.whatsappAccountId, user);
      return ServiceResponse.success("Broadcast fetched successfully", broadcast);
    } catch (ex) {
      logger.error(`Get broadcast error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to fetch broadcast", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateBroadcastStatus(user: any, id: number, status: string): Promise<ServiceResponse<any>> {
    try {
      const broadcast = await this.repository.findByIdAsync(id);
      if (!broadcast) return ServiceResponse.failure("Broadcast not found", null, StatusCodes.NOT_FOUND);

      await this.verifyAccountAccess(broadcast.whatsappAccountId, user);
      const updated = await this.repository.updateAsync(id, { status });
      return ServiceResponse.success(`Broadcast ${status} successfully`, updated);
    } catch (ex) {
      logger.error(`Update broadcast status error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to update broadcast status", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteBroadcast(user: any, id: number): Promise<ServiceResponse<any>> {
    try {
      const broadcast = await this.repository.findByIdAsync(id);
      if (!broadcast) return ServiceResponse.failure("Broadcast not found", null, StatusCodes.NOT_FOUND);

      await this.verifyAccountAccess(broadcast.whatsappAccountId, user);

      if (broadcast.status !== 'draft') return ServiceResponse.failure("Can only delete draft broadcasts", null, StatusCodes.BAD_REQUEST);

      const success = await this.repository.deleteAsync(id);
      return ServiceResponse.success("Broadcast deleted successfully", success);
    } catch (ex) {
      logger.error(`Delete broadcast error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to delete broadcast", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getBroadcastRecipients(user: any, broadcastId: number, filters: any): Promise<ServiceResponse<any>> {
    try {
      const broadcast = await this.repository.findByIdAsync(broadcastId);
      if (!broadcast) return ServiceResponse.failure("Broadcast not found", null, StatusCodes.NOT_FOUND);

      await this.verifyAccountAccess(broadcast.whatsappAccountId, user);

      const result = await this.repository.getRecipients(broadcastId, filters);
      return ServiceResponse.success("Recipients fetched successfully", result);
    } catch (ex) {
      logger.error(`Get broadcast recipients error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to fetch broadcast recipients", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
