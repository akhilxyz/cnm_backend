import Model from "@/db/models";

export class ChatbotFlowRepository {
  async createAsync(data: any) {
    return await Model.ChatbotFlow.create(data);
  }

  async findByIdAsync(id: number) {
    return await Model.ChatbotFlow.findByPk(id);
  }

  async findAllAsync(accountId: number, isActive?: boolean) {
    const where: any = { whatsappAccountId: accountId };
    if (isActive !== undefined) where.isActive = isActive;

    return await Model.ChatbotFlow.findAll({
      where,
      include: [{ association: "creator", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });
  }

  async updateAsync(id: number, data: any) {
    await Model.ChatbotFlow.update(data, { where: { id } });
    return this.findByIdAsync(id);
  }

  async deleteAsync(id: number) {
    const deleted = await Model.ChatbotFlow.destroy({ where: { id } });
    return deleted > 0;
  }
}
