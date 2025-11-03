import express, { type Router } from "express";
import { validateRequest } from "@/common/utils/httpHandlers";
import { whatsAppAccountController } from "./whatsapp.controller";
import { addMembersSchema, createAccountSchema, createCampaignSchema, createContactSchema, createGroupSchema, scheduleCampaignSchema, sendCampaignSchema, sendGroupMessageSchema, sendMessageSchema, sendTemplateMessageSchema, updateAdminsSchema, updateCampaignSchema, updateGroupSchema, updateGroupSettingsSchema } from "./whatsapp.schema";
import { authenticateToken } from "@/common/middleware/auth";
import { uploadFile } from "@/common/middleware/upload";

export const whatsappRouter: Router = express.Router();

// whatsappRoutes
whatsappRouter.post("/register", authenticateToken, validateRequest(createAccountSchema), whatsAppAccountController.createAccount);
whatsappRouter.get("/dashboard-data", authenticateToken, whatsAppAccountController.dashboardData);

//contacts
whatsappRouter.post("/add-contacts", authenticateToken, validateRequest(createContactSchema), whatsAppAccountController.createContact);
whatsappRouter.put("/update-contacts/:id", authenticateToken, whatsAppAccountController.updateContact);
whatsappRouter.get("/contacts-list", authenticateToken, whatsAppAccountController.getContacts);
whatsappRouter.delete("/contacts/:id", authenticateToken, whatsAppAccountController.deleteContact);
whatsappRouter.get("/contacts/tags", authenticateToken, whatsAppAccountController.contactTags);

// Export/Import routes
whatsappRouter.get("/contacts/export", authenticateToken, whatsAppAccountController.bulkExportContacts);
whatsappRouter.post("/contacts/import", authenticateToken, uploadFile.single('file'), whatsAppAccountController.bulkImportContacts);

//chat
// whatsappRouter.post("/send-message",authenticateToken, whatsAppAccountController.sendMessage);


// ✅ Receive message from Meta Webhook (public)
whatsappRouter.post("/webhook-verify", whatsAppAccountController.handleWebhook);
whatsappRouter.get("/webhook-verify", whatsAppAccountController.handleWebhook);


// 🚀 Send message (auth required)
whatsappRouter.post("/send", authenticateToken, validateRequest(sendMessageSchema), whatsAppAccountController.sendMessage);
whatsappRouter.post("/send-template", authenticateToken, validateRequest(sendTemplateMessageSchema), whatsAppAccountController.sendMessageTemplate);

// 💬 Get chat history
whatsappRouter.get("/history/:contactId", authenticateToken, whatsAppAccountController.getChatHistory);

// 🧾 Get all conversations
whatsappRouter.get("/conversations", authenticateToken, whatsAppAccountController.getConversations);

// 🔢 Unread count
whatsappRouter.get("/unread/:whatsappAccountId/:contactId", authenticateToken, whatsAppAccountController.getUnreadCount);
whatsappRouter.get("/unread/all", authenticateToken, whatsAppAccountController.getUnreadCountAll);

// 📩 Mark messages as read
whatsappRouter.put("/mark-read/:contactId", authenticateToken, whatsAppAccountController.markAsRead);


whatsappRouter.post("/upload/media",
    uploadFile.single("file"), // expects field name "file"
    authenticateToken, whatsAppAccountController.uplpadMedia);

whatsappRouter.get("/downloadMedia/:mediaId", authenticateToken, whatsAppAccountController.dowloadMedia);

// templates
whatsappRouter.get("/templates-list", authenticateToken, whatsAppAccountController.templateList);
whatsappRouter.post("/templates-create", authenticateToken, whatsAppAccountController.creatTemplate);


// groups

// WhatsApp Groups
whatsappRouter.post("/groups/create", authenticateToken, validateRequest(createGroupSchema), whatsAppAccountController.createGroup);
whatsappRouter.put("/groups/:groupId", authenticateToken, validateRequest(updateGroupSchema), whatsAppAccountController.updateGroup);
whatsappRouter.delete("/groups/:groupId", authenticateToken, whatsAppAccountController.deleteGroup);
whatsappRouter.get("/groups/list", authenticateToken, whatsAppAccountController.getGroups);
whatsappRouter.get("/groups/:groupId", authenticateToken, whatsAppAccountController.getGroupDetails);

// Group Members
whatsappRouter.post("/groups/:groupId/members", authenticateToken, validateRequest(addMembersSchema), whatsAppAccountController.addGroupMembers);
whatsappRouter.delete("/groups/:groupId/members/:phoneNumber", authenticateToken, whatsAppAccountController.removeGroupMember);
whatsappRouter.put("/groups/:groupId/admins", authenticateToken, validateRequest(updateAdminsSchema), whatsAppAccountController.updateGroupAdmins);

// Group Settings
whatsappRouter.put("/groups/:groupId/settings", authenticateToken, validateRequest(updateGroupSettingsSchema), whatsAppAccountController.updateGroupSettings);
whatsappRouter.put("/groups/:groupId/icon", uploadFile.single("file"), authenticateToken, whatsAppAccountController.updateGroupIcon);

// Group Messages
whatsappRouter.post("/groups/:groupId/send", authenticateToken, validateRequest(sendGroupMessageSchema), whatsAppAccountController.sendGroupMessage);
whatsappRouter.get("/groups/:groupId/history", authenticateToken, whatsAppAccountController.getGroupChatHistory);


// leads
whatsappRouter.get("/new_leads", authenticateToken, whatsAppAccountController.getNewLeads);


// Add these routes to your existing whatsappRouter

// ==================== CAMPAIGNS ====================
whatsappRouter.post("/campaigns/create", authenticateToken, validateRequest(createCampaignSchema), whatsAppAccountController.createCampaign);
whatsappRouter.get("/campaigns/list", authenticateToken, whatsAppAccountController.getCampaigns);
whatsappRouter.get("/campaigns/:id", authenticateToken, whatsAppAccountController.getCampaignDetails);
whatsappRouter.put("/campaigns/:id", authenticateToken, validateRequest(updateCampaignSchema), whatsAppAccountController.updateCampaign);
whatsappRouter.delete("/campaigns/:id", authenticateToken, whatsAppAccountController.deleteCampaign);

// Campaign Actions
whatsappRouter.post("/campaigns/:id/send", authenticateToken, validateRequest(sendCampaignSchema), whatsAppAccountController.sendCampaign);
whatsappRouter.post("/campaigns/:id/schedule", authenticateToken, validateRequest(scheduleCampaignSchema), whatsAppAccountController.scheduleCampaign);
whatsappRouter.post("/campaigns/:id/pause", authenticateToken, whatsAppAccountController.pauseCampaign);
whatsappRouter.post("/campaigns/:id/resume", authenticateToken, whatsAppAccountController.resumeCampaign);

// Campaign Analytics
whatsappRouter.get("/campaigns/:id/logs", authenticateToken, whatsAppAccountController.getCampaignLogs);
whatsappRouter.get("/campaigns/:id/stats", authenticateToken, whatsAppAccountController.getCampaignStats);