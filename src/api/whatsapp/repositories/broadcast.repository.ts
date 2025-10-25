import Model from "@/db/models";

export class BroadcastRepository {
  // Create a broadcast
  async createAsync(data: any) {
    const broadcast = await Model.Broadcast.create({
      whatsappAccountId: data.whatsappAccountId,
      name: data.name,
      templateId: data.templateId,
      segmentFilter: data.segmentFilter || {},
      status: data.status || 'draft',
      totalRecipients: data.totalRecipients || 0,
      scheduledAt: data.scheduledAt || null,
      createdBy: data.createdBy,
    });

    return broadcast;
  }

  // Find broadcast by ID
  async findByIdAsync(id: number) {
    return await Model.Broadcast.findByPk(id);
  }

  // Find all broadcasts for an account with pagination and filters
  async findAllAsync(accountId: number, filters: any) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const where: any = { whatsappAccountId: accountId };
    if (filters.status) {
      where.status = filters.status;
    }

    const { rows: broadcasts, count } = await Model.Broadcast.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      broadcasts,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  // Update a broadcast
  async updateAsync(id: number, data: any) {
    await Model.Broadcast.update(data, { where: { id } });
    return this.findByIdAsync(id);
  }

  // Delete a broadcast
  async deleteAsync(id: number) {
    const deleted = await Model.Broadcast.destroy({ where: { id } });
    return deleted > 0;
  }

  // Get broadcast recipients with pagination and optional status filter
  async getRecipients(broadcastId: number, filters: any) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    const where: any = { broadcastId };
    if (filters.status) {
      where.status = filters.status;
    }

    const { rows: recipients, count } = await Model.BroadcastRecipient.findAndCountAll({
      where,
      include: [{ association: 'contact', attributes: ['id', 'name', 'phoneNumber'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      recipients,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }
}
