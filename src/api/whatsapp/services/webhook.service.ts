import { ServiceResponse } from "@/common/models/serviceResponse";
import { WebhookRepository } from "../repositories/webhook.repository";
import { WhatsAppAccountRepository } from "../repositories/whatsAppAccount.repository";

export class WebhookService {
  private repo = new WebhookRepository();
  private accountRepo = new WhatsAppAccountRepository();

  async verifyWebhookToken(token: string) {
    return token = 'WH_VERIFY_2025_aSdF7gHjKl9pQ2wE4rTyU6iO8pAsDfGhJkL';
  }

  async logWebhook(payload: any, eventType = "incoming", status = "success", errorMessage?: string) {
    return await this.repo.createLog({
      eventType,
      payload,
      status,
      errorMessage,
    });
  }

  async getLogs(filters: any) {
    const logs = await this.repo.getLogs(filters);
    return ServiceResponse.success("Webhook logs fetched successfully", logs);
  }


}
