import { ContactRepository } from "@/api/whatsapp/repositories/contact.repository"
import { WhatsAppAccountRepository } from "@/api/whatsapp/repositories/whatsAppAccount.repository"

import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";
import Papa from 'papaparse';

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
        countryCode: payload.country_code,
        tag: payload?.tag ?? ''
      });

      return ServiceResponse.success("Contact created successfully", contact, StatusCodes.CREATED);
    } catch (ex) {
      logger.error(`Create contact error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to create contact", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getContacts(userId: any, query: any): Promise<ServiceResponse<any>> {
    try {
      const { page = 1, limit = 20, search, tag } = query;

      const hasAccess = await this.whatsappAccountRepository.findByUserIdAsync(userId);

      if (!hasAccess) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      const result = await this.repository.findAndCountAllAsync(
        hasAccess.id,
        Number(page),
        Number(limit),
        search,
        tag
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
        tag: payload.tag ?? contact.tag,
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

    async contactTags(userId: any): Promise<ServiceResponse<any>> {
    try {
      const hasAccess = await this.whatsappAccountRepository.findByUserIdAsync(userId);
      if (!hasAccess) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }
      const tags = await this.repository.findUniqueTagsAsync(hasAccess.id);

      return ServiceResponse.success("tags fetched successfully", {data : tags});
    } catch (ex) {
      logger.error(`failed to get contact tags error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to get contact tags", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async exportContacts(userId: number, format: string = 'csv'): Promise<ServiceResponse<any>> {
    try {
      const hasAccess = await this.whatsappAccountRepository.findByUserIdAsync(userId);

      if (!hasAccess) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      // Get all contacts without pagination
      const result = await this.repository.findAndCountAllAsync(
        hasAccess.id,
        1,
        10000, // Large limit to get all contacts
        undefined
      );

      if (result.total === 0) {
        return ServiceResponse.failure("No contacts found to export", null, StatusCodes.NOT_FOUND);
      }

      // Format contacts for export
      const exportData = result.data.map((contact: any) => ({
        name: contact.dataValues.name,
        phone_number: contact.dataValues.phoneNumber,
        country_code: contact.dataValues.countryCode,
        created_at: contact.dataValues.createdAt
      }));

      if (format === 'csv') {
        const csv = Papa.unparse(exportData, {
          header: true,
          columns: ['name', 'phone_number', 'country_code', 'created_at']
        });

        return ServiceResponse.success("Contacts exported successfully", csv);
      } else {
        // JSON format
        return ServiceResponse.success("Contacts exported successfully", JSON.stringify(exportData, null, 2));
      }
    } catch (ex) {
      logger.error(`Export contacts error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to export contacts", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async importContacts(userId: number, file: any, tag: string = ''): Promise<ServiceResponse<any>> {
    try {

      if (!file) {
        return ServiceResponse.failure("File Required", null, StatusCodes.BAD_REQUEST);
      }

      const hasAccess = await this.whatsappAccountRepository.findByUserIdAsync(userId);

      if (!hasAccess) {
        return ServiceResponse.failure("Access denied", null, StatusCodes.FORBIDDEN);
      }

      const fileContent = file.buffer.toString('utf-8');
      let contacts: any[] = [];

      // Parse CSV
      if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
        const parsed = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: any) => header.trim().toLowerCase().replace(/ /g, '_')
        });

        if (parsed.errors.length > 0) {
          return ServiceResponse.failure(
            `CSV parsing error: ${parsed.errors[0].message}`,
            null,
            StatusCodes.BAD_REQUEST
          );
        }

        contacts = parsed.data;
      } else {
        return ServiceResponse.failure("Unsupported file format", null, StatusCodes.BAD_REQUEST);
      }

      // Validate required fields
      const requiredFields = ['name', 'phone_number', 'country_code'];
      const invalidRows: number[] = [];
      const validContacts: any[] = [];

      contacts.forEach((contact: any, index: number) => {
        const hasAllFields = requiredFields.every(field =>
          contact[field] && contact[field].toString().trim() !== ''
        );

        if (!hasAllFields) {
          invalidRows.push(index + 2); // +2 because index starts at 0 and header is row 1
        } else {
          if (tag) {
            contact.tag = tag
          }

          validContacts.push(contact);
        }
      });

      if (invalidRows.length > 0) {
        return ServiceResponse.failure(
          `Invalid rows found at line(s): ${invalidRows.join(', ')}. Missing required fields: name, phone_number, country_code`,
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      // Process contacts
      const results = {
        success: 0,
        failed: 0,
        duplicates: 0,
        errors: [] as any[]
      };

      for (const contact of validContacts) {
        try {
          // Clean country code
          const countryCode = contact.country_code.toString().replace(/^\+/, '').trim();
          const phoneNumber = contact.phone_number.toString().trim();

          // Check if contact already exists
          const existing = await this.repository.findByPhoneNumberAsync(
            hasAccess.id,
            phoneNumber
          );

          if (existing) {
            results.duplicates++;
            continue;
          }

          // Create contact
          await this.repository.createAsync({
            whatsappAccountId: hasAccess.id,
            phoneNumber: countryCode + phoneNumber,
            name: contact.name.toString().trim(),
            countryCode: '+' + countryCode,
            tag: contact?.tag ?? ""
          });

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            contact: contact.name,
            error: (error as Error).message
          });
        }
      }

      return ServiceResponse.success(
        `Import completed: ${results.success} added, ${results.duplicates} duplicates skipped, ${results.failed} failed`,
        results,
        StatusCodes.OK
      );
    } catch (ex) {
      logger.error(`Import contacts error: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to import contacts", null, StatusCodes.INTERNAL_SERVER_ERROR);
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
