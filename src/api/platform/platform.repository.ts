import { Op } from "sequelize";

export class PlatformRepository {
  async findAllAsync(page: number, limit: number, search: string): Promise<any> {
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    // Apply search filter if provided
    // Apply global search across multiple fields
    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
  }
}
