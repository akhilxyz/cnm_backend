// src/repositories/newLead.repository.ts

import Model from "@/db/models";
import { Op } from "sequelize";

export class NewLeadRepository {

  
  async createAsync(data: any) {
    return await Model.NewLead.create(data);
  }

  async findByPhoneNumberAsync(whatsappAccountId: string, phoneNumber: string) {
    return await Model.NewLead.findOne({ where: { whatsappAccountId, phoneNumber } });
  }

  async findAllAsync() {
    return await Model.NewLead.findAll({ order: [["createdAt", "DESC"]] });
  }

   async getFilteredAsync({
    page = 1,
    limit = 10,
    search = "",
    startDate,
    endDate,
    sort = "DESC",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    sort?: "ASC" | "DESC";
  }) {
    const offset = (page - 1) * limit;
    const where: any = {};

    // 🔍 Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } },
      ];
    }

    // 📅 Date range filter

     // Date filter
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [
          new Date(startDate + "T00:00:00"),
          new Date(endDate + "T23:59:59"),
        ],
      };
    } else if (startDate) {
      where.createdAt = { [Op.gte]: new Date(startDate + "T00:00:00") };
    } else if (endDate) {
      where.createdAt = { [Op.lte]: new Date(endDate + "T23:59:59") };
    }

    const { rows, count } = await Model.NewLead.findAndCountAll({
      where,
      order: [["createdAt", sort]],
      limit,
      offset,
    });

    return {
      data: rows,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  }
}
