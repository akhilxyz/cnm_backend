import User from './user.model';
import OTP from './otp.model';
import WhatsAppAccount from './whatsAppAccount.model';
import Contact from './contact.model';
import Template from './template.model';
import Broadcast from './broadcast.model';
import BroadcastRecipient from './broadcastRecipient.model';
import QuickReply from './quickReply.model';
import ChatbotFlow from './chatbotFlow.model';
import WebhookLog from './webhookLog.model';
import { WhatsAppChat ,} from './whatsAppChat.model'
import Notification from './notification.model';
import { WhatsAppGroup } from './whatsAppGroup.model';
import NewLead from './newLeads.model';
import { Campaign, CampaignLog } from './campaign.model';
// Define associations here


const Model = {
  User,
  OTP,
  WhatsAppAccount,
  Contact,
  Template,
  BroadcastRecipient,
  Broadcast,
  QuickReply,
  ChatbotFlow,
  WebhookLog,
  WhatsAppChat,
  Notification,
  WhatsAppGroup,
  NewLead,
  Campaign,
  CampaignLog
};

export default Model;