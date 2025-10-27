// repositories/whatsapp.chat.repository.ts
import Model from '@/db/models'; // adjust path if needed
import { WhatsAppChat } from '@/db/models/whatsAppChat.model';
import { col, fn, literal, Op } from "sequelize";

export class WhatsAppChatRepository {
  /**
   * Create a new chat message
   */
  async createAsync(data: {
    whatsappAccountId: number;
    contactId: number;
    messageId: string;
    direction: 'inbound' | 'outbound';
    messageType: string;
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
   * Find chat by message ID
   */
  async findByMessageIdAsync(messageId: string): Promise<WhatsAppChat | null> {
    return await Model.WhatsAppChat.findOne({ where: { messageId } });
  }

  /**
   * Update message status
   */
  async updateStatusAsync(
    messageId: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    await Model.WhatsAppChat.update(
      { status, errorMessage: errorMessage || null },
      { where: { messageId } }
    );
  }

  /**
   * Get chat history for a contact
   */
  async findByContactAsync(
    contactId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{ chats: WhatsAppChat[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const { count, rows } = await Model.WhatsAppChat.findAndCountAll({
      where: { contactId },
      order: [['timestamp', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: Model.Contact,
          as: 'contact',
          attributes: ['id', 'name', 'phoneNumber']
        }
      ]
    });

    return {
      chats: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Get all conversations (contacts with last message)
   */
  async findConversationsAsync(whatsappAccountId: number): Promise<any[]> {
    const { WhatsAppChat, Contact } = Model;


    const conversations = await WhatsAppChat.findAll({
      where: { whatsappAccountId },
      attributes: [
        'contactId',
        [fn('MAX', col('WhatsAppChat.timestamp')), 'lastMessageTime'],
        [fn('COUNT', col('WhatsAppChat.id')), 'messageCount'],
        [
          literal(`(
        SELECT w2.status
        FROM \`whatsapp_chats\` AS w2
        WHERE w2.contactId = WhatsAppChat.contactId
        ORDER BY w2.timestamp DESC
        LIMIT 1
      )`),
          'status'
        ], [
          literal(`(
            SELECT 
              CASE 
                WHEN w2.content IS NULL OR w2.content = '' THEN w2.messageType
                ELSE w2.content
              END
            FROM \`whatsapp_chats\` AS w2
            WHERE w2.contactId = WhatsAppChat.contactId
            ORDER BY w2.timestamp DESC
            LIMIT 1
          )`),
          'lastMessage'
        ]
      ],
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'phoneNumber']
        }
      ],
      group: ['WhatsAppChat.contactId', 'contact.id'],
      order: [[literal('MAX(WhatsAppChat.timestamp)'), 'DESC']]
    });


    return conversations;
  }


  /**
   * Get unread message count
   */
  async getUnreadCountAsync(whatsappAccountId: number, contactId: number): Promise<number> {
    return await Model.WhatsAppChat.count({
      where: {
        whatsappAccountId,
        contactId,
        direction: 'inbound',
        status: { [Op.ne]: 'read' }
      }
    });
  }

  async getUnreadCountAllAsync(whatsappAccountId: number): Promise<number> {
    return await Model.WhatsAppChat.count({
      where: {
        whatsappAccountId,
        direction: 'inbound',
        status: { [Op.ne]: 'read' }
      }
    });
  }

  /**
   * Mark messages as read
   */
  async markAsReadAsync(contactId: number): Promise<void> {
    await Model.WhatsAppChat.update(
      { status: 'read' },
      {
        where: {
          contactId,
          direction: 'inbound',
          status: { [Op.ne]: 'read' }
        }
      }
    );
  }
}
