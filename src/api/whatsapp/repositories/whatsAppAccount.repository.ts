import Model from '@/db/models'; // adjust path if needed
import { WhatsAppChat } from '@/db/models/whatsAppChat.model';

export class WhatsAppAccountRepository {
  /**
   * Get all WhatsApp accounts with pagination
   */
  async findAllAsync(page = 1, limit = 10, filters: any = {}): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;

    const { rows, count } = await Model.WhatsAppAccount.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return { data: rows as any, total: count };
  }

  /**
   * Find a single WhatsApp account by ID
   */
  async findByIdAsync(id: number, userId?: number): Promise<any | null> {
    const where: any = { id };
    if (userId) where.userId = userId;

    const account = await Model.WhatsAppAccount.findOne({ where });
    return account ? account.get({ plain: true }) : null;
  }

  async findByUserIdAsync(userId: number): Promise<any | null> {
    const account = await Model.WhatsAppAccount.findOne({ where: { userId } });
    return account ? account.get({ plain: true }) : null;
  }

  /**
   * Find WhatsApp account by phone number
   */
  async findByPhoneNumberAsync(phoneNumber: string): Promise<any | null> {
    const account = await Model.WhatsAppAccount.findOne({ where: { phoneNumber } });
    return account ? account.get({ plain: true }) : null;
  }

  async findByPhoneNumberIdAsync(phoneNumberId: string): Promise<any | null> {
    const account = await Model.WhatsAppAccount.findOne({ where: { phoneNumberId } });
    return account ? account.get({ plain: true }) : null;
  }

  /**
   * Create a new WhatsApp account
   */
  async createAsync(data: {
    whatsappAccountId: number;
    contactId: number;
    messageId: string;
    direction: 'inbound' | 'outbound';
    messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contacts' | "template";
    content?: string | null;
    mediaUrl?: string | null;
    mediaId?: string | null;
    mimeType?: string | null;
    caption?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    status: string;
    metadata?: object | null;
    timestamp: Date;
  }): Promise<WhatsAppChat> {
    return await Model.WhatsAppChat.create(data);
  }

  /**
   * Update WhatsApp account details
   */
  async updateAsync(id: number, data: Partial<any>, userId?: number): Promise<any> {
    const where: any = { id };
    if (userId) where.userId = userId;

    await Model.WhatsAppAccount.update(data, { where });
    return this.findByIdAsync(id);
  }

  /**
   * Update WhatsApp account status
   */
  async updateStatusAsync(id: number, status: any): Promise<void> {
    await Model.WhatsAppAccount.update({ status }, { where: { id } });
  }

  /**
   * Delete WhatsApp account
   */
  async deleteAsync(id: number, userId?: number): Promise<boolean> {
    const where: any = { id };
    if (userId) where.userId = userId;

    const deletedCount = await Model.WhatsAppAccount.destroy({ where });
    return deletedCount > 0;
  }

  /**
   * Get account statistics (optional aggregation logic could go here)
   */
  async getStatsAsync(accountId: number): Promise<any> {
    // This is a placeholder — actual logic should join related models
    // Example:
    // const contactsCount = await Model.Contact.count({ where: { whatsappAccountId: accountId } });
    // return { totalContacts: contactsCount };

    return {}; // Add later if needed
  }
}
