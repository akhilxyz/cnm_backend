import Model from "@/db/models";

export class QuickReplyRepository {
  async createAsync(data: any) {
    return await Model.QuickReply.create(data);
  }

  async findByIdAsync(id: number) {
    return await Model.QuickReply.findByPk(id);
  }

  async findAllAsync(accountId: number) {
    return await Model.QuickReply.findAll({
      where: { whatsappAccountId: accountId },
      include: [{ association: "creator", attributes: ["id", "name"] }],
      order: [["shortcut", "ASC"]],
    });
  }

  async updateAsync(id: number, data: any) {
    await Model.QuickReply.update(data, { where: { id } });
    return this.findByIdAsync(id);
  }

  async deleteAsync(id: number) {
    const deleted = await Model.QuickReply.destroy({ where: { id } });
    return deleted > 0;
  }

  async existsShortcut(accountId: number, shortcut: string) {
    const count = await Model.QuickReply.count({
      where: { whatsappAccountId: accountId, shortcut },
    });
    return count > 0;
  }
}
