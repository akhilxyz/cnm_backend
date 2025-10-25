import Model from '@/db/models';

export class TemplateRepository {
  async findAllAsync(page = 1, limit = 20, filters: any = {}): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const where: any = {};
    if (filters.whatsappAccountId) where.whatsappAccountId = filters.whatsappAccountId;
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    const { rows, count } = await Model.Template.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return { data: rows, total: count };
  }

  async findByIdAsync(id: number): Promise<any | null> {
    return await Model.Template.findByPk(id);
  }

  async createAsync(data: any): Promise<any> {
    return await Model.Template.create(data);
  }

  async updateAsync(id: number, data: any): Promise<any> {
    await Model.Template.update(data, { where: { id } });
    return this.findByIdAsync(id);
  }

  async deleteAsync(id: number): Promise<boolean> {
    const deleted = await Model.Template.destroy({ where: { id } });
    return deleted > 0;
  }
}
