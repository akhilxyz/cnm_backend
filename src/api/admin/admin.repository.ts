import Model from "@/db/models";

export class AdminRepository {

  async findAllAsync(page = 1, limit = 10): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;
    const { rows, count } = {rows : [], count : 0}
    return {
      data: rows as any,
      total: count,
    };
  }
  
}
