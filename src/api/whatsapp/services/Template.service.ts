import { ServiceResponse } from "@/common/models/serviceResponse";
import { TemplateRepository } from "../repositories/template.repository";
import { WhatsAppAccountRepository } from "../repositories/whatsAppAccount.repository";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";

export class TemplateService {
  private repository = new TemplateRepository();
  private accountRepo = new WhatsAppAccountRepository();

  async createTemplate(user: any, data: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepo.findByIdAsync(
        data.whatsappAccountId,
        user.role === "admin" ? undefined : user.id
      );
      if (!account) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      const template = await this.repository.createAsync({
        ...data,
        header: data.header ? JSON.stringify(data.header) : null,
        footer: data.footer || null,
        buttons: data.buttons ? JSON.stringify(data.buttons) : null,
        status: "PENDING",
      });

      return ServiceResponse.success("Template created successfully", template);
    } catch (ex) {
      logger.error(`Create template error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to create template", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getTemplates(user: any, filters: any): Promise<ServiceResponse<any>> {
    try {
      const account = await this.accountRepo.findByIdAsync(
        filters.whatsappAccountId,
        user.role === "admin" ? undefined : user.id
      );
      if (!account) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      const result = await this.repository.findAllAsync(filters.page, filters.limit, filters);
      return ServiceResponse.success("Templates fetched successfully", result);
    } catch (ex) {
      logger.error(`Get templates error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to fetch templates", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getTemplate(user: any, id: number): Promise<ServiceResponse<any>> {
    try {
      const template = await this.repository.findByIdAsync(id);
      if (!template) {
        return ServiceResponse.failure("Template not found", null, StatusCodes.NOT_FOUND);
      }

      const account = await this.accountRepo.findByIdAsync(
        template.whatsappAccountId,
        user.role === "admin" ? undefined : user.id
      );
      if (!account) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      return ServiceResponse.success("Template fetched successfully", template);
    } catch (ex) {
      logger.error(`Get template error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to fetch template", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateTemplate(user: any, id: number, data: any): Promise<ServiceResponse<any>> {
    try {
      const template = await this.repository.findByIdAsync(id);
      if (!template) {
        return ServiceResponse.failure("Template not found", null, StatusCodes.NOT_FOUND);
      }

      const account = await this.accountRepo.findByIdAsync(
        template.whatsappAccountId,
        user.role === "admin" ? undefined : user.id
      );
      if (!account) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      const updated = await this.repository.updateAsync(id, {
        ...data,
        header: data.header ? JSON.stringify(data.header) : null,
        footer: data.footer || null,
        buttons: data.buttons ? JSON.stringify(data.buttons) : null,
        status: "PENDING",
      });

      return ServiceResponse.success("Template updated successfully", updated);
    } catch (ex) {
      logger.error(`Update template error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to update template", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteTemplate(user: any, id: number): Promise<ServiceResponse<any>> {
    try {
      const template = await this.repository.findByIdAsync(id);
      if (!template) {
        return ServiceResponse.failure("Template not found", null, StatusCodes.NOT_FOUND);
      }

      const account = await this.accountRepo.findByIdAsync(
        template.whatsappAccountId,
        user.role === "admin" ? undefined : user.id
      );
      if (!account) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      const success = await this.repository.deleteAsync(id);
      if (!success) {
        return ServiceResponse.failure("Failed to delete template", null, StatusCodes.BAD_REQUEST);
      }

      return ServiceResponse.success("Template deleted successfully", null);
    } catch (ex) {
      logger.error(`Delete template error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to delete template", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
