import { Request, Response, RequestHandler } from "express";
import { WhatsAppAccountService } from "@/api/whatsapp/services/whatsAppAccount.service";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { ContactService } from "./services/contact.service";
import { TemplateService } from "./services/Template.service";
import { BroadcastService } from "./services/broadcast.service";
import { QuickReplyService } from "./services/quickReply.service";
import { ChatbotFlowService } from "./services/chatbotFlow.service";
import { WebhookService } from "./services/webhook.service";
import { WhatsAppChatService } from "./services/whatsAppChat.service";
import { WhatsAppGroupService } from "./services/whatsappGroup.service";
import { Parser } from "json2csv";
import { CampaignService } from "./services/campaign.service";
import { DashboardService } from "./services/dashboard.service";

const service = new WhatsAppAccountService();
const contactService = new ContactService();
const templateService = new TemplateService();
const broadcastService = new BroadcastService();
const quickReplyService = new QuickReplyService();
const chatbotFlowService = new ChatbotFlowService();
const webhookService = new WebhookService();
const chatService = new WhatsAppChatService();
const groupService = new WhatsAppGroupService();
const campaignService = new CampaignService();
const dashboardService = new DashboardService();


export class WhatsAppAccountController {
  public createAccount: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user
    const serviceResponse = await service.createOrUpdateAccount(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public dashboardData: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user
    const serviceResponse = await dashboardService.getDashboardData(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public getAccounts: RequestHandler = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status?.toString();
    const serviceResponse = await service.findAll(req.user, page, limit, status);
    return handleServiceResponse(serviceResponse, res);
  };

  public sendMessage: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user
    const serviceResponse = await service.sendMessage(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public sendMessageTemplate: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user
    const serviceResponse = await service.sendMessageTemplate(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public getAccount: RequestHandler = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const serviceResponse = await service.findById(req.user, id);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateAccount: RequestHandler = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const serviceResponse = await service.updateAccount(req.user, id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateStatus: RequestHandler = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const serviceResponse = await service.updateStatus(id, status);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteAccount: RequestHandler = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const serviceResponse = await service.deleteAccount(req.user, id);
    return handleServiceResponse(serviceResponse, res);
  };

  // Contacts 
  public createContact: RequestHandler = async (req, res) => {
    const { id } = req.user as any
    const serviceResponse = await contactService.createContact(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public getContacts: RequestHandler = async (req, res) => {
    const { id } = req.user as any
    const serviceResponse = await contactService.getContacts(id, req.query);
    return handleServiceResponse(serviceResponse, res);
  };

  public getContact: RequestHandler = async (req, res) => {
    const serviceResponse = await contactService.getContact(req.user, Number(req.params.id));
    return handleServiceResponse(serviceResponse, res);
  };

  public updateContact: RequestHandler = async (req, res) => {
    const { id } = req.user as any
    const serviceResponse = await contactService.updateContact(id, Number(req.params.id), req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteContact: RequestHandler = async (req, res) => {
    const { id } = req.user as any
    const serviceResponse = await contactService.deleteContact(id, Number(req.params.id));
    return handleServiceResponse(serviceResponse, res);
  };

  public bulkImportContacts: RequestHandler = async (req, res) => {
    const serviceResponse = await contactService.bulkImportContacts(req.user, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  // templete

  public createTemplate: RequestHandler = async (req: Request, res: Response) => {
    const { id, role }: any = req.user;
    const serviceResponse = await templateService.createTemplate({ id, role }, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public getTemplates: RequestHandler = async (req: Request, res: Response) => {
    const { id, role }: any = req.user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status?.toString();
    const category = req.query.category?.toString();
    const whatsappAccountId = parseInt(req.query.whatsapp_account_id as string);

    const serviceResponse = await templateService.getTemplates(
      { id, role },
      { page, limit, status, category, whatsappAccountId }
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getTemplateById: RequestHandler = async (req: Request, res: Response) => {
    const { id, role }: any = req.user;
    const templateId = parseInt(req.params.id);
    const serviceResponse = await templateService.getTemplate({ id, role }, templateId);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateTemplate: RequestHandler = async (req: Request, res: Response) => {
    const { id, role }: any = req.user;
    const templateId = parseInt(req.params.id);
    const serviceResponse = await templateService.updateTemplate({ id, role }, templateId, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteTemplate: RequestHandler = async (req: Request, res: Response) => {
    const { id, role }: any = req.user;
    const templateId = parseInt(req.params.id);
    const serviceResponse = await templateService.deleteTemplate({ id, role }, templateId);
    return handleServiceResponse(serviceResponse, res);
  };

  // BroadCast
  public createBroadcast: RequestHandler = async (req, res) => {
    const serviceResponse = await broadcastService.createBroadcast(req.user, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public getBroadcasts: RequestHandler = async (req, res) => {
    const filters = {
      whatsappAccountId: Number(req.query.whatsapp_account_id),
      status: req.query.status,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    };
    const serviceResponse = await broadcastService.getBroadcasts(req.user, filters);
    return handleServiceResponse(serviceResponse, res);
  };

  public getBroadcast: RequestHandler = async (req, res) => {
    const serviceResponse = await broadcastService.getBroadcast(req.user, Number(req.params.id));
    return handleServiceResponse(serviceResponse, res);
  };

  public startBroadcast: RequestHandler = async (req, res) => {
    const serviceResponse = await broadcastService.updateBroadcastStatus(req.user, Number(req.params.id), 'sending');
    return handleServiceResponse(serviceResponse, res);
  };

  public pauseBroadcast: RequestHandler = async (req, res) => {
    const serviceResponse = await broadcastService.updateBroadcastStatus(req.user, Number(req.params.id), 'paused');
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteBroadcast: RequestHandler = async (req, res) => {
    const serviceResponse = await broadcastService.deleteBroadcast(req.user, Number(req.params.id));
    return handleServiceResponse(serviceResponse, res);
  };

  public getRecipients: RequestHandler = async (req, res) => {
    const filters = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 50,
      status: req.query.status,
    };
    const serviceResponse = await broadcastService.getBroadcastRecipients(req.user, Number(req.params.id), filters);
    return handleServiceResponse(serviceResponse, res);
  };

  // Quick Reply
  public createQuickReply: RequestHandler = async (req, res) => {
    const response = await quickReplyService.createQuickReply(req.user, req.body);
    return handleServiceResponse(response, res);
  };

  public getQuickReplies: RequestHandler = async (req, res) => {
    const accountId = parseInt(req.query.whatsappAccountId as string);
    const response = await quickReplyService.getQuickReplies(req.user, accountId);
    return handleServiceResponse(response, res);
  };

  public getQuickReply: RequestHandler = async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await quickReplyService.getQuickReply(req.user, id);
    return handleServiceResponse(response, res);
  };

  public updateQuickReply: RequestHandler = async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await quickReplyService.updateQuickReply(req.user, id, req.body);
    return handleServiceResponse(response, res);
  };

  public deleteQuickReply: RequestHandler = async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await quickReplyService.deleteQuickReply(req.user, id);
    return handleServiceResponse(response, res);
  };

  // chatBot Flow 

  public createFlow: RequestHandler = async (req, res) => {
    const response = await chatbotFlowService.createFlow(req.user, req.body);
    return handleServiceResponse(response, res);
  };

  public getFlows: RequestHandler = async (req, res) => {
    const accountId = parseInt(req.query.whatsappAccountId as string);
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
    const response = await chatbotFlowService.getFlows(req.user, accountId, isActive);
    return handleServiceResponse(response, res);
  };

  public getFlow: RequestHandler = async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await chatbotFlowService.getFlow(req.user, id);
    return handleServiceResponse(response, res);
  };

  public updateFlow: RequestHandler = async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await chatbotFlowService.updateFlow(req.user, id, req.body);
    return handleServiceResponse(response, res);
  };

  public deleteFlow: RequestHandler = async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await chatbotFlowService.deleteFlow(req.user, id);
    return handleServiceResponse(response, res);
  };

  // Webhook

  public verifyWebhook: RequestHandler = async (req, res) => {
    try {
      const mode = req.query["hub.mode"];
      const token: any = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (mode && token && (await webhookService.verifyWebhookToken(token))) {
        console.log("Webhook verified");
        return res.status(200).send(challenge);
      }

      return res.sendStatus(403);
    } catch (error) {
      console.error("Webhook verification error:", error);
      res.sendStatus(500);
    }
  };

  public handleWebhook: RequestHandler = async (req, res) => {
    try {
      // Verification request (GET)
      if (req.method === "GET") {
        const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
        // Replace with the token you configured in Meta dashboard
        const verifyToken = "WH_VERIFY_2025_aSdF7gHjKl9pQ2wE4rTyU6iO8pAsDfGhJkL";

        if (mode === 'subscribe' && token === verifyToken) {
          console.log('WEBHOOK VERIFIED');
          res.status(200).send(challenge);
        } else {
          res.status(403).end();
        }
      }

      if (req.method === "POST") {
        // Incoming webhook (POST)
        const payload = req.body
        await new WhatsAppChatService().handleWebhook(payload)
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        console.log(`\n\nWebhook received ${timestamp}\n`);
        res.status(200).end();
      }


    } catch (error: any) {
      console.error("Webhook handling error:", error);
      await webhookService.logWebhook(req.body, "incoming", "failed", error.message);
      res.sendStatus(500);
    }
  };

  public getWebhookLogs: RequestHandler = async (req, res) => {
    const { whatsappAccountId, page, limit, status } = req.query;
    const response = await webhookService.getLogs({
      whatsappAccountId: whatsappAccountId ? parseInt(whatsappAccountId as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
      status: status ? (status as string) : undefined,
    });
    return handleServiceResponse(response, res);
  };

  //whatsapp chats

  public handleWAWebhook: RequestHandler = async (req, res) => {
    const response = await chatService.handleWebhook(req.body);
    return handleServiceResponse(response, res);
  };

  public sendWAMessage: RequestHandler = async (req, res) => {
    const { id } = req.user as any;
    const response = await chatService.sendMessage(id, req.body);
    return handleServiceResponse(response, res);
  };

  public getChatHistory: RequestHandler = async (req, res) => {
    const { contactId } = req.params;
    const { page = 1, limit = 50 } = req.query as any;
    const { id } = req.user as any;
    const response = await chatService.getChatHistory(id, Number(contactId), Number(page), Number(limit));
    return handleServiceResponse(response, res);
  };

  public getConversations: RequestHandler = async (req, res) => {
    const { id } = req.user as any;
    const response = await chatService.getConversations(id);
    return handleServiceResponse(response, res);
  };

  public getUnreadCount: RequestHandler = async (req, res) => {
    const { whatsappAccountId, contactId } = req.params as any;
    const response = await chatService.getUnreadCount(Number(whatsappAccountId), Number(contactId));
    return handleServiceResponse(response, res);
  };

   public getUnreadCountAll: RequestHandler = async (req, res) => {
      const { id } = req.user as any;
    const response = await chatService.getUnreadCountAll(Number(id));
    return handleServiceResponse(response, res);
  };

  public markAsRead: RequestHandler = async (req, res) => {
    const { contactId } = req.params as any;
    const response = await chatService.markAsRead(Number(contactId));
    return handleServiceResponse(response, res);
  };

  public uplpadMedia: RequestHandler = async (req, res) => {
    const { id } = req.user as any;
    console.log("req.file", req.file)
    const response = await service.uploadMedia(Number(id), req.file);
    return handleServiceResponse(response, res);
  };

  public dowloadMedia: RequestHandler = async (req, res) => {
    const { id } = req.user as any;
    const { mediaId } = req.params as any;
    const response = await service.downloadMedia(Number(id), mediaId ?? null);
    return handleServiceResponse(response, res);
  };

  public templateList: RequestHandler = async (req, res) => {
    const { id } = req.user as any;
    const response = await service.templateList(Number(id));
    return handleServiceResponse(response, res);
  };

  public creatTemplate: RequestHandler = async (req, res) => {
    const { id } = req.user as any;
    const response = await service.createTemplate(Number(id), req.body);
    return handleServiceResponse(response, res);
  };


  public createGroup: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const serviceResponse = await groupService.createGroup(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  // Update Group
  public updateGroup: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { groupId } = req.params;
    const serviceResponse = await groupService.updateGroup(id, groupId, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  // Delete Group
  public deleteGroup: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { groupId } = req.params;
    const serviceResponse = await groupService.deleteGroup(id, groupId);
    return handleServiceResponse(serviceResponse, res);
  };

  // Get Groups List
  public getGroups: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { page = 1, limit = 10 } = req.query;
    const serviceResponse = await groupService.getGroups(id, Number(page), Number(limit));
    return handleServiceResponse(serviceResponse, res);
  };

  // Get Group Details
  public getGroupDetails: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { groupId } = req.params;
    const serviceResponse = await groupService.getGroupDetails(id, groupId);
    return handleServiceResponse(serviceResponse, res);
  };

  // Add Members
  public addGroupMembers: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { groupId } = req.params;
    const serviceResponse = await groupService.addMembers(id, groupId, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  // Remove Member
  public removeGroupMember: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { groupId, phoneNumber } = req.params;
    const serviceResponse = await groupService.removeMember(id, groupId, phoneNumber);
    return handleServiceResponse(serviceResponse, res);
  };

  // Update Admins
  public updateGroupAdmins: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { groupId } = req.params;
    const serviceResponse = await groupService.updateAdmins(id, groupId, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  // Update Group Settings
  public updateGroupSettings: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { groupId } = req.params;
    const serviceResponse = await groupService.updateSettings(id, groupId, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  // Update Group Icon
  public updateGroupIcon: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { groupId } = req.params;
    const serviceResponse = await groupService.updateGroupIcon(id, groupId, req.file);
    return handleServiceResponse(serviceResponse, res);
  };

  // Send Group Message
  public sendGroupMessage: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { groupId } = req.params;
    const serviceResponse = await groupService.sendGroupMessage(id, groupId, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  // Get Group Chat History
  public getGroupChatHistory: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const serviceResponse = await groupService.getGroupChatHistory(
      id,
      groupId,
      Number(page),
      Number(limit)
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getNewLeads: RequestHandler = async (req: Request, res: Response) => {
    try {
      const { id }: any = req?.user; // logged-in user (if applicable)
      const queryParams = req.query

      const page = Number(queryParams.page) || 1;
      const limit = Number(queryParams.limit) || 50;
      const search = queryParams.search || "";
      const startDate = queryParams.startDate || null;
      const endDate = queryParams.endDate || null;
      const sort = queryParams.sort || 'DESC'
      const download = queryParams.download === "true";

      const serviceResponse = await chatService.getNewLeads(
        id,
        Number(page),
        Number(download ? 1000 : limit),
        String(search),
        startDate ? String(startDate) : undefined,
        endDate ? String(endDate) : undefined,
        sort === "ASC" ? "ASC" : "DESC"
      );

      if (download && serviceResponse.responseObject) {
        const leads = serviceResponse.responseObject.data
        console.log("leads", leads)
        // Convert to CSV
        const fields = ["id", "name", "phoneNumber", "message", "createdAt"];
        const parser = new Parser({ fields });
        const csv = parser.parse(leads);

        // Set headers to trigger download
        res.header("Content-Type", "text/csv");
        res.header("Content-Disposition", `attachment; filename="new_leads_${Date.now()}.csv"`);
        return res.send(csv);
      }

      return handleServiceResponse(serviceResponse, res);
    } catch (error) {
      console.error("❌ Error in getNewLeads controller:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch new leads",
      });
    }
  };



  // ==================== CAMPAIGNS ====================

  public createCampaign: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const serviceResponse = await campaignService.createCampaign(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public getCampaigns: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { page = 1, limit = 10, status } = req.query;
    const serviceResponse = await campaignService.getCampaigns(
      id,
      Number(page),
      Number(limit),
      status as string
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getCampaignDetails: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { id: campaignId } = req.params;
    const serviceResponse = await campaignService.getCampaignDetails(id, Number(campaignId));
    return handleServiceResponse(serviceResponse, res);
  };

  public updateCampaign: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { id: campaignId } = req.params;
    const serviceResponse = await campaignService.updateCampaign(id, Number(campaignId), req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteCampaign: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { id: campaignId } = req.params;
    const serviceResponse = await campaignService.deleteCampaign(id, Number(campaignId));
    return handleServiceResponse(serviceResponse, res);
  };

  public sendCampaign: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { id: campaignId } = req.params;
    const serviceResponse = await campaignService.sendCampaign(id, Number(campaignId));
    return handleServiceResponse(serviceResponse, res);
  };

  public scheduleCampaign: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { id: campaignId } = req.params;
    const serviceResponse = await campaignService.scheduleCampaign(
      id,
      Number(campaignId),
      req.body.scheduledAt
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public pauseCampaign: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { id: campaignId } = req.params;
    const serviceResponse = await campaignService.pauseCampaign(id, Number(campaignId));
    return handleServiceResponse(serviceResponse, res);
  };

  public resumeCampaign: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { id: campaignId } = req.params;
    const serviceResponse = await campaignService.resumeCampaign(id, Number(campaignId));
    return handleServiceResponse(serviceResponse, res);
  };

  public getCampaignLogs: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { id: campaignId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const serviceResponse = await campaignService.getCampaignLogs(
      id,
      Number(campaignId),
      Number(page),
      Number(limit)
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getCampaignStats: RequestHandler = async (req: Request, res: Response) => {
    const { id }: any = req?.user;
    const { id: campaignId } = req.params;
    const serviceResponse = await campaignService.getCampaignStats(id, Number(campaignId));
    return handleServiceResponse(serviceResponse, res);
  };

}


export const whatsAppAccountController = new WhatsAppAccountController()