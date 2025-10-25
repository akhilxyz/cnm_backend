
import { ServiceResponse } from "@/common/models/serviceResponse";
import sequelize from "@/db/config";
import Model from "@/db/models";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { WhatsAppAccountRepository } from "../repositories/whatsAppAccount.repository";


const whatsAppAccountRepository = new WhatsAppAccountRepository()
/**
 * Dashboard Service
 * Provides aggregated data for dashboard metrics and visualizations
 */
export class DashboardService {
  
  /**
   * Get comprehensive dashboard data including:
   * - Total counts (contacts, campaigns, templates)
   * - Message activity graph (7 days)
   * - Campaign performance graph (6 months)
   * - Delivery rate statistics
   */
  async getDashboardData(userId: number) {
    try {
      // Get date ranges
      const today = new Date();
      const last7Days = new Date(today);
      last7Days.setDate(today.getDate() - 7);
      
      const last6Months = new Date(today);
      last6Months.setMonth(today.getMonth() - 6);


       const findUser = await whatsAppAccountRepository.findByUserIdAsync(userId);
      if (!findUser) {
        return ServiceResponse.failure("Account not found", null, StatusCodes.NOT_FOUND);
      }

      // 1. Get Total Counts
      const totalContacts = await Model.Contact.count({
        where: { whatsappAccountId :findUser.id }
      });

      const totalCampaigns = await Model.Campaign.count({
        where: { whatsappAccountId :findUser.id }
      });

      const totalTemplates = await Model.Template.count({
        where: { whatsappAccountId :findUser.id }
      });

      // 2. Get Message Activity for Last 7 Days
      const messageActivity = await this.getMessageActivity(findUser.id, last7Days, today);

      // 3. Get Campaign Performance for Last 6 Months
      const campaignPerformance = await this.getCampaignPerformance(findUser.id, last6Months, today);

      // 4. Get Delivery Rate Statistics
      const deliveryRate = await this.getDeliveryRate(findUser.id);

      // 5. Get Recent Activity Summary
      const recentActivity = await this.getRecentActivity(findUser.id);

      const dashboardData = {
        summary: {
          totalContacts: totalContacts || 0,
          totalCampaigns: totalCampaigns || 0,
          totalTemplates: totalTemplates || 0,
        },
        messageActivity,
        campaignPerformance,
        deliveryRate,
        recentActivity,
      };

      return ServiceResponse.success("Dashboard data fetched successfully", dashboardData);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      return ServiceResponse.failure(
        "Failed to fetch dashboard data",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get message activity for the last 7 days
   * Returns data in format: [{ name: 'Mon', messages: 45, delivered: 42 }]
   */
  private async getMessageActivity(userId: number, startDate: Date, endDate: Date) {
    try {
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const messageData: any[] = [];

      // Get messages grouped by day for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const result = await Model.WhatsAppChat.findAll({
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
            [
              sequelize.literal(
                `SUM(CASE WHEN status IN ('delivered', 'read') THEN 1 ELSE 0 END)`
              ),
              'delivered'
            ]
          ],
          where: {
            whatsappAccountId :  userId,
            createdAt: {
              [Op.between]: [dayStart, dayEnd]
            }
          },
          raw: true
        });

        const data: any = result[0] || { total: 0, delivered: 0 };

        messageData.push({
          name: daysOfWeek[date.getDay()],
          messages: Number(data.total || 0),
          delivered: Number(data.delivered || 0),
        });
      }

      return messageData;
    } catch (error) {
      console.error("Error fetching message activity:", error);
      return [];
    }
  }

  /**
   * Get campaign performance for the last 6 months
   * Returns data in format: [{ name: 'Jan', campaigns: 12 }]
   */
  private async getCampaignPerformance(userId: number, startDate: Date, endDate: Date) {
    try {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const campaignData: any[] = [];

      // Get campaigns grouped by month for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(endDate);
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

        const count = await Model.Campaign.count({
          where: {
            whatsappAccountId : userId,
            createdAt: {
              [Op.between]: [monthStart, monthEnd]
            }
          }
        });

        campaignData.push({
          name: monthNames[date.getMonth()],
          campaigns: Number(count || 0),
        });
      }

      return campaignData;
    } catch (error) {
      console.error("Error fetching campaign performance:", error);
      return [];
    }
  }

  /**
   * Calculate overall delivery rate and related statistics
   */
  private async getDeliveryRate(userId: number) {
    try {
      const result = await Model.WhatsAppChat.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalSent'],
          [
            sequelize.literal(`SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)`),
            'delivered'
          ],
          [
            sequelize.literal(`SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END)`),
            'read'
          ],
          [
            sequelize.literal(`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`),
            'failed'
          ],
          [
            sequelize.literal(`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`),
            'pending'
          ]
        ],
        where: {whatsappAccountId : userId },
        raw: true
      });

      const data: any = result[0] || {
        totalSent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        pending: 0
      };

      const totalSent = Number(data.totalSent || 0);
      const delivered = Number(data.delivered || 0);
      const read = Number(data.read || 0);
      const failed = Number(data.failed || 0);
      const pending = Number(data.pending || 0);

      const deliveryRate = totalSent > 0 ? ((delivered + read) / totalSent) * 100 : 0;
      const readRate = totalSent > 0 ? (read / totalSent) * 100 : 0;
      const failureRate = totalSent > 0 ? (failed / totalSent) * 100 : 0;

      return {
        totalSent,
        delivered,
        read,
        failed,
        pending,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        readRate: Math.round(readRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
      };
    } catch (error) {
      console.error("Error calculating delivery rate:", error);
      return {
        totalSent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        pending: 0,
        deliveryRate: 0,
        readRate: 0,
        failureRate: 0,
      };
    }
  }

  /**
   * Get recent activity summary
   */
  private async getRecentActivity(userId: number) {
    try {
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);

      // Messages sent in last 24 hours
      const messagesLast24h = await Model.WhatsAppChat.count({
        where: {
          whatsappAccountId : userId,
          createdAt: {
            [Op.gte]: last24Hours
          }
        }
      });

      // Active campaigns
      const activeCampaigns = await Model.Campaign.count({
        where: {
          whatsappAccountId : userId,
          status: 'active'
        }
      });

      // New contacts in last 7 days
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const newContacts = await Model.Contact.count({
        where: {
            whatsappAccountId : userId,
          createdAt: {
            [Op.gte]: last7Days
          }
        }
      });

      return {
        messagesLast24h: Number(messagesLast24h || 0),
        activeCampaigns: Number(activeCampaigns || 0),
        newContactsLast7Days: Number(newContacts || 0),
      };
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return {
        messagesLast24h: 0,
        activeCampaigns: 0,
        newContactsLast7Days: 0,
      };
    }
  }
}