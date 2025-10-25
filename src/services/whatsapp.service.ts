import { logger } from '@/server';
import axios, { AxiosInstance } from 'axios';

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string;
}

interface Participant {
  input: string;
  wa_id: string;
}

interface CreateGroupParams {
  subject: string;
  description?: string;
  joinApprovalMode?: "auto_approve" | "approval_required";
  participants?: Participant[];
}



interface MediaMessage {
  to: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  mediaId?: string;
  caption?: string;
  filename?: string;
}

interface TemplateMessage {
  to: string;
  templateName: string;
  languageCode: string;
  components?: any[];
}

interface LocationMessage {
  to: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

interface ContactMessage {
  to: string;
  contacts: Array<{
    name: {
      formatted_name: string;
      first_name?: string;
      last_name?: string;
    };
    phones?: Array<{
      phone: string;
      type?: string;
    }>;
  }>;
}



export class WhatsAppService {
  private client: AxiosInstance;
  private phoneNumberId: string;
  private baseUrl: string;


  constructor(config: WhatsAppConfig) {
    const apiVersion = config.apiVersion || 'v22.0';
    this.baseUrl = `https://graph.facebook.com/${apiVersion}/${config.phoneNumberId}`;
    this.phoneNumberId = config.phoneNumberId
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Send text message
  // NOTE: This only works within 24 hours after user messages you first
  async sendTextMessage(params: any): Promise<any> {
    try {
      const { type, to, ...rest } = params;


      // Log for debugging
      console.log("📤 Sending message:", { type, to, ...rest });

      // ✅ Build correct payload based on Meta's latest docs
      let payload: any;

      if (type === 'template') {
        payload = {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: rest.templateName || 'hello_world',
            language: {
              code: rest.languageCode || 'en_US'
            },
            ...(rest.components && { components: rest.components })
          }
        };
      } else {
        // ✅ Correct text message payload per Meta docs
        payload = {
          messaging_product: 'whatsapp',
          to, // NO recipient_type needed
          type: 'text',
          text: {
            body: rest.text // ✅ Use 'body', not 'message'
          }
        };

        // Only add preview_url if it's true
        if (rest.previewUrl === true) {
          payload.text.preview_url = true;
        }
      }

      console.log("payload", payload)
      const response = await this.client.post('/messages', payload);

      return response.data;

    } catch (error: any) {
      console.log("errorerror", error)
      // Better error logging
      console.error('❌ WhatsApp API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Handle specific error codes
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;

        // 24-hour window expired
        if (apiError.code === 131047) {
          throw new Error(
            '❌ Cannot send text message: 24-hour session expired. User must message you first, or use a template message to start conversation.'
          );
        }

        // Invalid phone number format
        if (apiError.code === 131026) {
          throw new Error(
            `❌ Invalid phone number format. Use country code without '+' (e.g., "919876543210")`
          );
        }

        // Invalid parameter
        if (apiError.code === 100) {
          throw new Error(
            `❌ Invalid parameter: ${apiError.message || 'Check your payload structure'}`
          );
        }

        throw new Error(`❌ WhatsApp API Error (${apiError.code}): ${apiError.message}`);
      }

      throw error;
    }
  }


  // Send media message
  async sendMediaMessage(params: MediaMessage): Promise<any> {
    try {
      const mediaPayload: any = {};

      if (params.mediaId) {
        mediaPayload.id = params.mediaId;
      } else if (params.mediaUrl) {
        mediaPayload.link = params.mediaUrl;
      } else {
        throw new Error('Either mediaId or mediaUrl must be provided');
      }

      if (params.caption) {
        mediaPayload.caption = params.caption;
      }

      if (params.type === 'document' && params.filename) {
        mediaPayload.filename = params.filename;
      }

      const response = await this.client.post('/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to,
        type: params.type,
        [params.type]: mediaPayload,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send template message
  async sendTemplateMessage(params: TemplateMessage): Promise<any> {
    try {
      const response = await this.client.post('/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to,
        type: 'template',
        template: {
          name: params.templateName,
          language: {
            code: params.languageCode,
          },
          components: params.components || [],
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send location message
  async sendLocationMessage(params: LocationMessage): Promise<any> {
    try {
      const response = await this.client.post('/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to,
        type: 'location',
        location: {
          latitude: params.latitude,
          longitude: params.longitude,
          name: params.name,
          address: params.address,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send contact message
  async sendContactMessage(params: ContactMessage): Promise<any> {
    try {
      const response = await this.client.post('/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to,
        type: 'contacts',
        contacts: params.contacts,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 🟣 Fetch all templates from Meta API
  async fetchTemplates(): Promise<any> {
    try {
      const response = await this.client.get("/message_templates");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send interactive button message
  async sendButtonMessage(params: {
    to: string;
    bodyText: string;
    buttons: Array<{ id: string; title: string }>;
    headerText?: string;
    footerText?: string;
  }): Promise<any> {
    try {
      const message: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: params.bodyText },
          action: {
            buttons: params.buttons.map(btn => ({
              type: 'reply',
              reply: {
                id: btn.id,
                title: btn.title,
              },
            })),
          },
        },
      };

      if (params.headerText) {
        message.interactive.header = {
          type: 'text',
          text: params.headerText,
        };
      }

      if (params.footerText) {
        message.interactive.footer = {
          text: params.footerText,
        };
      }

      const response = await this.client.post('/messages', message);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send interactive list message
  async sendListMessage(params: {
    to: string;
    bodyText: string;
    buttonText: string;
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
    headerText?: string;
    footerText?: string;
  }): Promise<any> {
    try {
      const message: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: params.bodyText },
          action: {
            button: params.buttonText,
            sections: params.sections,
          },
        },
      };

      if (params.headerText) {
        message.interactive.header = {
          type: 'text',
          text: params.headerText,
        };
      }

      if (params.footerText) {
        message.interactive.footer = {
          text: params.footerText,
        };
      }

      const response = await this.client.post('/messages', message);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark message as read
  async markAsRead(messageId: string): Promise<any> {
    try {
      const response = await this.client.post('/messages', {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadMedia(file: any): Promise<string> {
    try {
      const formData: any = new FormData();
      // Convert buffer to readable stream
      // Convert buffer to Blob
      const blob = new Blob([file.buffer], { type: file.mimetype });

      // Append the blob with filename
      formData.append("file", blob, file.originalname);
      formData.append("messaging_product", "whatsapp");

      const response = await axios.post(
        `https://graph.facebook.com/v22.0/${this.baseUrl.split("/").pop()}/media`,
        formData,
        {
          headers: {
            Authorization: this.client.defaults.headers['Authorization'] as string,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }




  // Get media URL
  async getMediaUrl(mediaId: string): Promise<string> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          headers: {
            'Authorization': this.client.defaults.headers['Authorization'],
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTemplate(payload: {
    name: string;
    language: string;
    category: 'MARKETING' | 'UTILITY' | 'TRANSACTIONAL';
    parameter_format?: 'POSITIONAL' | 'NAMED';
    components: any[];
  }): Promise<any> {
    try {
      // Ensure name is lowercase with underscores
      const formattedPayload = {
        ...payload,
        name: payload.name.toLowerCase().replace(/\s+/g, '_'),
        parameter_format: payload.parameter_format || 'POSITIONAL',
      };

      const response = await this.client.post('/message_templates', formattedPayload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Download media
  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(mediaUrl, {
        headers: {
          'Authorization': this.client.defaults.headers['Authorization'],
        },
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message;
      const code = error.response?.data?.error?.code || error.code;
      return new Error(`WhatsApp API Error [${code}]: ${message}`);
    }
    return error;
  }

  // Create Group
  /**
 * Create WhatsApp group and return payload in "group_lifecycle_update" format
 */
  async createGroup(params: CreateGroupParams) {
    try {
      const payload = {
        messaging_product: "whatsapp",
        subject: params.subject,
        description: params.description || "",
        join_approval_mode: params.joinApprovalMode || "auto_approve",
      };

      const response = await this.client.post("/groups", payload);

      // Example response formatting
      const groupResponse = {
        field: "group_lifecycle_update",
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: "12345550001", // replace with your number
            phone_number_id: this.phoneNumberId,
          },
          groups: [
            {
              timestamp: Date.now(),
              type: "group_create",
              subject: params.subject,
              description: params.description || "",
              request_id: "request-id-" + Date.now(),
              group_id: response.data?.id || "TestGroupId", // from API
              invite_link: response.data?.invite_link || "https://chat.whatsapp.com/ABCDE",
              join_approval_mode: params.joinApprovalMode || "auto_approve",
              added_participants: params.participants || [],
            },
          ],
        },
      };

      return groupResponse;
    } catch (error: any) {

      console.error(
          "Error creating WhatsApp group:",
          error.response?.data || error.message
        );
        throw error.response?.data;



       
      }
    }


/**
   * Send a message to multiple recipients (simulated group)
   */
  async sendToGroup(params: any) {
      try {
        const results = await Promise.all(
          params.recipients.map(async (to: any) => {
            const payload: any = {
              messaging_product: "whatsapp",
              to,
            };

            if (params.type === "text") {
              payload.type = "text";
              payload.text = { body: params.body };
            }

            if (params.type === "media" && params.mediaId) {
              payload.type = "image"; // change type if needed
              payload.image = { id: params.mediaId, caption: params.body };
            }

            const res = await this.client.post("/messages", payload);
            return { to, response: res.data };
          })
        );

        return results;
      } catch (error: any) {
        console.error("Error sending group message:", error.response?.data || error.message);
        throw error;
      }
    }

// Update Group
async updateGroup(groupId: string, params: any): Promise < any > {
      try {
        const response = await this.client.put(`/groups/${groupId}`, params);
        return response.data;
      } catch(error: any) {
        logger.error("Error updating group:", error.response?.data || error.message);
        throw error;
      }
    }

// Leave/Delete Group
async leaveGroup(groupId: string): Promise < any > {
      try {
        const response = await this.client.post(`/groups/${groupId}/leave`);
        return response.data;
      } catch(error: any) {
        logger.error("Error leaving group:", error.response?.data || error.message);
        throw error;
      }
    }

// Get Group Info
async getGroupInfo(groupId: string): Promise < any > {
      try {
        const response = await this.client.get(`/groups/${groupId}`);
        return response.data;
      } catch(error: any) {
        logger.error("Error fetching group info:", error.response?.data || error.message);
        throw error;
      }
    }

// Add Participants
async addGroupParticipants(groupId: string, participants: string[]): Promise < any > {
      try {
        const payload = {
          participants: participants,
        };

        const response = await this.client.post(`/groups/${groupId}/participants`, payload);
        return response.data;
      } catch(error: any) {
        logger.error("Error adding participants:", error.response?.data || error.message);
        throw error;
      }
    }

// Remove Participant
async removeGroupParticipant(groupId: string, phoneNumber: string): Promise < any > {
      try {
        const response = await this.client.delete(`/groups/${groupId}/participants/${phoneNumber}`);
        return response.data;
      } catch(error: any) {
        logger.error("Error removing participant:", error.response?.data || error.message);
        throw error;
      }
    }

// Promote/Demote Admin
async updateGroupAdmin(groupId: string, phoneNumber: string, action: "promote" | "demote"): Promise < any > {
      try {
        const endpoint = action === "promote" ? "promote" : "demote";
        const response = await this.client.post(`/groups/${groupId}/admins/${endpoint}`, {
          participants: [phoneNumber],
        });
        return response.data;
      } catch(error: any) {
        logger.error("Error updating admin:", error.response?.data || error.message);
        throw error;
      }
    }

// Update Group Settings
async updateGroupSettings(groupId: string, settings: any): Promise < any > {
      try {
        const response = await this.client.put(`/groups/${groupId}/settings`, settings);
        return response.data;
      } catch(error: any) {
        logger.error("Error updating settings:", error.response?.data || error.message);
        throw error;
      }
    }

// Update Group Icon
async updateGroupIcon(groupId: string, mediaId: string): Promise < any > {
      try {
        const response = await this.client.put(`/groups/${groupId}/icon`, {
          media_id: mediaId,
        });
        return response.data;
      } catch(error: any) {
        logger.error("Error updating icon:", error.response?.data || error.message);
        throw error;
      }
    }

// Send Group Message
async sendGroupMessage(params: any): Promise < any > {
      try {
        const payload: any = {
          messaging_product: "whatsapp",
          to: params.groupId,
          type: params.type || "text",
        };

        if(params.type === "text") {
      payload.text = {
        body: params.content,
      };
    } else if (params.mediaId) {
      payload[params.type] = {
        id: params.mediaId,
        ...(params.caption && { caption: params.caption }),
        ...(params.fileName && { filename: params.fileName }),
      };
    }

    const response = await this.client.post("/messages", payload);
    return response.data;
  } catch(error: any) {
    logger.error("Error sending group message:", error.response?.data || error.message);
    throw error;
  }
}
}

// Example usage:
/*
const whatsapp = new WhatsAppService({
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
  accessToken: 'YOUR_ACCESS_TOKEN',
  apiVersion: 'v18.0'
});

// Send text message
await whatsapp.sendTextMessage({
  to: '1234567890',
  text: 'Hello from WhatsApp Business API!',
  previewUrl: true
});

// Send image
await whatsapp.sendMediaMessage({
  to: '1234567890',
  type: 'image',
  mediaUrl: 'https://example.com/image.jpg',
  caption: 'Check out this image!'
});

// Send button message
await whatsapp.sendButtonMessage({
  to: '1234567890',
  bodyText: 'How can we help you?',
  buttons: [
    { id: 'btn1', title: 'Support' },
    { id: 'btn2', title: 'Sales' }
  ],
  headerText: 'Welcome!',
  footerText: 'Powered by WhatsApp'
});
*/