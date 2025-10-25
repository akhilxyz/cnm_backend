import { ServiceResponse } from "@/common/models/serviceResponse";
import { QuickReplyRepository } from "../repositories/quickReply.repository";
import { WhatsAppAccountRepository } from "../repositories/whatsAppAccount.repository";
import { StatusCodes } from "http-status-codes";

export class QuickReplyService {
  private repo = new QuickReplyRepository();
  private accountRepo = new WhatsAppAccountRepository();

  private async verifyAccountAccess(accountId: number, userId: number, role: string) {
    const account = await this.accountRepo.findByIdAsync(accountId, role === "admin" ? undefined : userId);
    return !!account;
  }

  async createQuickReply(user: any, data: any) {
    const hasAccess = await this.verifyAccountAccess(data.whatsappAccountId, user.id, user.role);
    if (!hasAccess) return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

    const exists = await this.repo.existsShortcut(data.whatsappAccountId, data.shortcut);
    if (exists) return ServiceResponse.failure("Shortcut already exists", null, StatusCodes.BAD_REQUEST);

    const quickReply = await this.repo.createAsync({
      ...data,
      createdBy: user.id,
    });

    return ServiceResponse.success("Quick reply created successfully", quickReply);
  }

  async getQuickReplies(user: any, accountId: number) {
    const hasAccess = await this.verifyAccountAccess(accountId, user.id, user.role);
    if (!hasAccess) return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

    const quickReplies = await this.repo.findAllAsync(accountId);
    return ServiceResponse.success("Quick replies fetched successfully", quickReplies);
  }

  async getQuickReply(user: any, id: number) {
    const quickReply = await this.repo.findByIdAsync(id);
    if (!quickReply) return ServiceResponse.failure("Quick reply not found", null, StatusCodes.NOT_FOUND);

    const hasAccess = await this.verifyAccountAccess(quickReply.whatsappAccountId, user.id, user.role);
    if (!hasAccess) return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

    return ServiceResponse.success("Quick reply fetched successfully", quickReply);
  }

  async updateQuickReply(user: any, id: number, data: any) {
    const quickReply = await this.repo.findByIdAsync(id);
    if (!quickReply) return ServiceResponse.failure("Quick reply not found", null, StatusCodes.NOT_FOUND);

    const hasAccess = await this.verifyAccountAccess(quickReply.whatsappAccountId, user.id, user.role);
    if (!hasAccess) return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

    const updated = await this.repo.updateAsync(id, data);
    return ServiceResponse.success("Quick reply updated successfully", updated);
  }

  async deleteQuickReply(user: any, id: number) {
    const quickReply = await this.repo.findByIdAsync(id);
    if (!quickReply) return ServiceResponse.failure("Quick reply not found", null, StatusCodes.NOT_FOUND);

    const hasAccess = await this.verifyAccountAccess(quickReply.whatsappAccountId, user.id, user.role);
    if (!hasAccess) return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

    const success = await this.repo.deleteAsync(id);
    return ServiceResponse.success("Quick reply deleted successfully", success);
  }
}
