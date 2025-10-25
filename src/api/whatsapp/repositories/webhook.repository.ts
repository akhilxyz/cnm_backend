import Model from '@/db/models';

export class WebhookRepository {
    async createLog(data: any) {
        return await Model.WebhookLog.create(data);
    }

    async getLogs(filters: { whatsappAccountId?: number; status?: string; page?: number; limit?: number }) {
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const offset = (page - 1) * limit;

        const where: any = {};
        if (filters.whatsappAccountId) where.whatsappAccountId = filters.whatsappAccountId;
        if (filters.status) where.status = filters.status;

        const { rows, count } = await Model.WebhookLog.findAndCountAll({
            where,
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        return {
            logs: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit),
            },
        };
    }

      /**
       * Create webhook log
       */
      async createAsync(data: {
        whatsappAccountId: number;
        eventType: string;
        payload: object;
        status: string;
      }): Promise<any> {
        return await Model.WebhookLog.create(data);
      }
    
      /**
       * Update webhook log status
       */
      async updateStatusAsync(
        whatsappAccountId: number,
        status: string,
        errorMessage?: string
      ): Promise<void> {
        await Model.WebhookLog.update(
          { status, errorMessage: errorMessage || null },
          {
            where: { whatsappAccountId },
            // order: [['createdAt', 'DESC']],
            limit: 1
          }
        );
      }
    
      /**
       * Get webhook logs
       */
      async findByAccountAsync(
        whatsappAccountId: number,
        limit: number = 100
      ): Promise<any[]> {
        return await Model.WebhookLog.findAll({
          where: { whatsappAccountId },
          order: [['createdAt', 'DESC']],
          limit
        });
      }
    
      /**
       * Get failed webhook logs
       */
      async findFailedAsync(whatsappAccountId: number): Promise<any[]> {
        return await Model.WebhookLog.findAll({
          where: { whatsappAccountId, status: 'failed' },
          order: [['createdAt', 'DESC']]
        });
      }
}
