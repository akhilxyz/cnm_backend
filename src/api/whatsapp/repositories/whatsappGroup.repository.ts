import Model from "@/db/models";

export class WhatsAppGroupRepository {
  async createAsync(data: any): Promise<any> {
    return await Model.WhatsAppGroup.create(data);
  }

  async findByGroupIdAsync(groupId: string): Promise<any> {
    return await Model.WhatsAppGroup.findOne({
      where: { groupId },
    });
  }

  async findAllAsync(
    whatsappAccountId: number,
    page = 1,
    limit = 10
  ): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await Model.WhatsAppGroup.findAndCountAll({
      where: { whatsappAccountId },
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    return { data: rows as any, total: count };
  }

  async updateAsync(id: number, data: any): Promise<any> {
    await Model.WhatsAppGroup.update(data, { where: { id } });
    return await Model.WhatsAppGroup.findByPk(id);
  }

  async deleteAsync(id: number): Promise<boolean> {
    const deleted = await Model.WhatsAppGroup.destroy({ where: { id } });
    return deleted > 0;
  }

  async getChatHistoryAsync(
    groupId: string,
    page = 1,
    limit = 50
  ): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await Model.WhatsAppGroupChat.findAndCountAll({
      where: { groupId },
      offset,
      limit,
      order: [["timestamp", "DESC"]],
    });

    return { data: rows as any, total: count };
  }
}