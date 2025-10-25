import { ServiceResponse } from "@/common/models/serviceResponse";
import { ChatbotFlowRepository } from "../repositories/chatbotFlow.repository";
import { WhatsAppAccountRepository } from "../repositories/whatsAppAccount.repository";
import { StatusCodes } from "http-status-codes";

export class ChatbotFlowService {
  private repo = new ChatbotFlowRepository();
  private accountRepo = new WhatsAppAccountRepository();

  private async verifyAccountAccess(accountId: number, userId: number, role: string) {
    const account = await this.accountRepo.findByIdAsync(accountId, role === "admin" ? undefined : userId);
    return !!account;
  }

  async createFlow(user: any, data: any) {
    const hasAccess = await this.verifyAccountAccess(data.whatsappAccountId, user.id, user.role);
    if (!hasAccess) return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

    const flow = await this.repo.createAsync({
      ...data,
      flowData: JSON.stringify(data.flowData),
      createdBy: user.id,
    });

    return ServiceResponse.success("Chatbot flow created successfully", flow);
  }

  async getFlows(user: any, accountId: number, isActive?: boolean) {
    const hasAccess = await this.verifyAccountAccess(accountId, user.id, user.role);
    if (!hasAccess) return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

    const flows = await this.repo.findAllAsync(accountId, isActive);
    return ServiceResponse.success("Chatbot flows fetched successfully", flows);
  }

  async getFlow(user: any, id: number) {
    const flow = await this.repo.findByIdAsync(id);
    if (!flow) return ServiceResponse.failure("Chatbot flow not found", null, StatusCodes.NOT_FOUND);

    const hasAccess = await this.verifyAccountAccess(flow.whatsappAccountId, user.id, user.role);
    if (!hasAccess) return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

    return ServiceResponse.success("Chatbot flow fetched successfully", flow);
  }

  async updateFlow(user: any, id: number, data: any) {
    const flow = await this.repo.findByIdAsync(id);
    if (!flow) return ServiceResponse.failure("Chatbot flow not found", null, StatusCodes.NOT_FOUND);

    const hasAccess = await this.verifyAccountAccess(flow.whatsappAccountId, user.id, user.role);
    if (!hasAccess) return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

    if (data.flowData) data.flowData = JSON.stringify(data.flowData);

    const updated = await this.repo.updateAsync(id, data);
    return ServiceResponse.success("Chatbot flow updated successfully", updated);
  }

  async deleteFlow(user: any, id: number) {
    const flow = await this.repo.findByIdAsync(id);
    if (!flow) return ServiceResponse.failure("Chatbot flow not found", null, StatusCodes.NOT_FOUND);

    const hasAccess = await this.verifyAccountAccess(flow.whatsappAccountId, user.id, user.role);
    if (!hasAccess) return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);

    const success = await this.repo.deleteAsync(id);
    return ServiceResponse.success("Chatbot flow deleted successfully", success);
  }
}
