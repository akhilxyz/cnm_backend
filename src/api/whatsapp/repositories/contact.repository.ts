import Model from "@/db/models";
import { Op } from "sequelize";

export class ContactRepository {
  async findByPhoneNumberAsync(whatsappAccountId: number, phoneNumber: string) {
    return Model.Contact.findOne({
      where: { whatsappAccountId, phoneNumber },
      raw: true
    });
  }

  async findByWAIdAsync(whatsappAccountId: number, id: number) {
    return Model.Contact.findOne({
      where: { whatsappAccountId, id },
    });
  }

  async createAsync(data: any) {
    return Model.Contact.create(data);
  }

  async findAndCountAllAsync(
    whatsappAccountId: number,
    page = 1,
    limit = 20,
    search?: string,
  ) {
    const offset = (page - 1) * limit;
    const where: any = { whatsappAccountId };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } },
      ];
    }
    const { rows, count } = await Model.Contact.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      data: rows,
      total: count,
    };
  }

  async findByIdAsync(id: number) {
    const contact = await Model.Contact.findByPk(id);
    return contact ? contact.get({ plain: true }) : null;
  }


  async findByIdsAsync(ids: number[]) {
    const contacts = await Model.Contact.findAll({
      where: { id: { [Op.in]: ids } }
    });
    return contacts.length ? contacts.map(c => c.get({ plain: true })) : [];
  }


  async updateAsync(id: number, data: any) {
    const contact = await Model.Contact.findByPk(id);
    if (!contact) return null;
    return contact.update(data);
  }

  async deleteAsync(id: number, whatsappAccountId: number) {
    return Model.Contact.destroy({ where: { id, whatsappAccountId } });
  }

  async bulkCreateAsync(contacts: any[]) {
    return Model.Contact.bulkCreate(contacts);
  }
}
