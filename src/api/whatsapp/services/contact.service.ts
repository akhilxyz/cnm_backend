import { ContactRepository } from "@/api/whatsapp/repositories/contact.repository"
import { WhatsAppAccountRepository } from "@/api/whatsapp/repositories/whatsAppAccount.repository"

import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";

export class ContactService {
  private repository: ContactRepository;
  private whatsappAccountRepository: WhatsAppAccountRepository;

  constructor(
    repository: ContactRepository = new ContactRepository(),
    whatsappAccountRepository: WhatsAppAccountRepository = new WhatsAppAccountRepository()
  ) {
    this.repository = repository;
    this.whatsappAccountRepository = whatsappAccountRepository;
  }

  private async verifyAccountAccess(
    whatsappAccountId: number,
    userId: number,
    role: string
  ): Promise<boolean> {
    const account = await this.whatsappAccountRepository.findByIdAsync(
      whatsappAccountId,
      role !== "admin" ? userId : undefined
    );
    return !!account;
  }

  async createContact(userId: number, payload: any): Promise<ServiceResponse<any>> {
    try {
      const hasAccess = await this.whatsappAccountRepository.findByUserIdAsync(userId);
      if (!hasAccess) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      const existing = await this.repository.findByPhoneNumberAsync(
        hasAccess.id,
        payload.phone_number
      );
      if (existing) {
        return ServiceResponse.failure("Contact already exists", null, StatusCodes.BAD_REQUEST);
      }
      const countryCode = payload.country_code.replace(/^\+/, '');

      const contact = await this.repository.createAsync({
        whatsappAccountId: hasAccess.id,
        phoneNumber: countryCode + payload.phone_number,
        name: payload.name,
        countryCode: payload.country_code
      });

      return ServiceResponse.success("Contact created successfully", contact, StatusCodes.CREATED);
    } catch (ex) {
      logger.error(`Create contact error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to create contact", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getContacts(userId: any, query: any): Promise<ServiceResponse<any>> {
    try {
      const {  page = 1, limit = 20, search } = query;

      const hasAccess = await this.whatsappAccountRepository.findByUserIdAsync(userId);

      if (!hasAccess) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      const result = await this.repository.findAndCountAllAsync(
        hasAccess.id,
        Number(page),
        Number(limit),
        search,
      );

      const pagination = {
        total: result.total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(result.total / Number(limit)),
      };

      return ServiceResponse.success("Contacts fetched successfully", {
        contacts: result.data,
        pagination,
      });
    } catch (ex) {
      logger.error(`Get contacts error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to fetch contacts", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getContact(user: any, id: number): Promise<ServiceResponse<any>> {
    try {
      const contact = await this.repository.findByIdAsync(id);
      if (!contact) {
        return ServiceResponse.failure("Contact not found", null, StatusCodes.NOT_FOUND);
      }

      const hasAccess = await this.verifyAccountAccess(
        contact.whatsappAccountId,
        user.id,
        user.role
      );
      if (!hasAccess) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      return ServiceResponse.success("Contact fetched successfully", contact);
    } catch (ex) {
      logger.error(`Get contact error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to fetch contact", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateContact(userId: any, id: number, payload: any): Promise<ServiceResponse<any>> {
    try {
       const hasAccess = await this.whatsappAccountRepository.findByUserIdAsync(userId);
      if (!hasAccess) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      const contact: any = await this.repository.findByWAIdAsync(hasAccess.id, id);
      if (!contact) {
        return ServiceResponse.failure("Contact not found", null, StatusCodes.NOT_FOUND);
      }

      const updated = await this.repository.updateAsync(id, {
        name: payload.name ?? contact.name,
        status: payload.status ?? contact.status,
      });

      return ServiceResponse.success("Contact updated successfully", updated);
    } catch (ex) {
      logger.error(`Update contact error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to update contact", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteContact(userId: any, id: number): Promise<ServiceResponse<any>> {
    try {
      const hasAccess = await this.whatsappAccountRepository.findByUserIdAsync(userId);
      if (!hasAccess) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }
      const contact = await this.repository.findByIdAsync(id);
      if (!contact) {
        return ServiceResponse.failure("Contact not found", null, StatusCodes.NOT_FOUND);
      }
      await this.repository.deleteAsync(id, hasAccess.id);
      return ServiceResponse.success("Contact deleted successfully", null);
    } catch (ex) {
      logger.error(`Delete contact error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to delete contact", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async bulkImportContacts(user: any, payload: any): Promise<ServiceResponse<any>> {
    try {
      const hasAccess = await this.verifyAccountAccess(
        payload.whatsapp_account_id,
        user.id,
        user.role
      );
      if (!hasAccess) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      const imported: string[] = [];
      const skipped: string[] = [];

      for (const contact of payload.contacts) {
        const existing = await this.repository.findByPhoneNumberAsync(
          payload.whatsapp_account_id,
          contact.phone_number
        );

        if (existing) {
          skipped.push(contact.phone_number);
          continue;
        }

        await this.repository.createAsync({
          whatsappAccountId: payload.whatsapp_account_id,
          phoneNumber: contact.phone_number,
          name: contact.name || null,
          tags: contact.tags || [],
          customFields: contact.custom_fields || {},
        });

        imported.push(contact.phone_number);
      }

      return ServiceResponse.success(
        `Imported ${imported.length} contacts, skipped ${skipped.length}`,
        { imported, skipped }
      );
    } catch (ex) {
      logger.error(`Bulk import error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to import contacts", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
