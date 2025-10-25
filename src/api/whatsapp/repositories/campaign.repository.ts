import Model from "@/db/models";
import { col, fn, Op } from "sequelize";

export class CampaignRepository {
    async createAsync(data: any): Promise<any> {
        return await Model.Campaign.create(data);
    }

    async findByIdAsync(id: number): Promise<any> {
        const campaign = await Model.Campaign.findByPk(id, {
            include: [
            {
                model: Model.CampaignLog,
                as: 'logs',
                required: false,
            },
            ],
        });

        return campaign ? campaign.get({ plain: true }) : null;
        }


    async findAllAsync(
        page = 1,
        limit = 10,
        filters: any = {}
    ): Promise<{ data: any[]; total: number }> {
        const offset = (page - 1) * limit;

        const where: any = {};

        if (filters.whatsappAccountId) where.whatsappAccountId = filters.whatsappAccountId;
        if (filters.status) where.status = filters.status;
        if (filters.createdBy) where.createdBy = filters.createdBy;

        const { rows, count } = await Model.Campaign.findAndCountAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Model.CampaignLog,
                    as: 'logs',
                    attributes: [],
                    required: false,
                },
            ],
        });

        return { data: rows as any, total: count };
    }

    async updateAsync(id: number, data: any): Promise<any> {
        await Model.Campaign.update(data, { where: { id } });
        return await Model.Campaign.findByPk(id);
    }

    async deleteAsync(id: number): Promise<boolean> {
        // Delete logs first
        await Model.CampaignLog.destroy({ where: { campaignId: id } });
        // Delete campaign
        const deleted = await Model.Campaign.destroy({ where: { id } });
        return deleted > 0;
    }

    // Find campaigns scheduled to run
    async findScheduledCampaigns(): Promise<any[]> {
        return await Model.Campaign.findAll({
            where: {
                status: 'scheduled',
                scheduledAt: {
                    [Op.lte]: new Date(),
                },
            },
        });
    }

    // Campaign Logs
    async createLogsAsync(logs: any[]): Promise<any> {
        return await Model.CampaignLog.bulkCreate(logs);
    }

    async deleteLogsAsync(campaignId: number): Promise<boolean> {
        const deleted = await Model.CampaignLog.destroy({ where: { campaignId } });
        return deleted > 0;
    }

    async getPendingLogsAsync(campaignId: number): Promise<any[]> {
        return await Model.CampaignLog.findAll({
            where: {
                campaignId,
                status: 'pending',
            },
            order: [["createdAt", "ASC"]],
        });
    }

    async updateLogAsync(id: number, data: any): Promise<any> {
        await Model.CampaignLog.update(data, { where: { id } });
        return await Model.CampaignLog.findByPk(id);
    }

    async getLogsAsync(
        campaignId: number,
        page = 1,
        limit = 50
    ): Promise<{ data: any[]; total: number }> {
        const offset = (page - 1) * limit;

        const { rows, count } = await Model.CampaignLog.findAndCountAll({
            where: { campaignId },
            offset,
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Model.Contact,
                    as: 'contact',
                    attributes: ['id', 'name', 'phoneNumber'],
                    required: false,
                },
            ],
        });

        return { data: rows as any, total: count };
    }

    async getStatsAsync(campaignId: number): Promise<any> {
        const stats = await Model.CampaignLog.findAll({
            where: { campaignId },
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'count'],
            ],
            group: ['status'],
            raw: true,
        });

        const result: any = {};
        stats.forEach((stat: any) => {
            result[stat.status] = parseInt(stat.count);
        });

        return result;
    }
}

