import Model from "@/db/models";
import { CheckUserParams, CreateOTPInput, CreateUserInput, OTP, UpdateUserParams, User } from "@/interface/user.interface";
import { Op } from "sequelize";

export class UserRepository {
  async findAllAsync(page: number, limit: number, search: string): Promise<{ data: User[], total: number }> {
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

    const { rows, count } = await Model.User.findAndCountAll({
      offset,
      limit,
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows as any[],
      total: count,
    };
  }

   /**
   * Check if user exists (excluding a specific user ID)
   */
  async checkIfUserExistsExcludingId(
    data: { email?: string; phoneNumber?: string },
    excludeUserId: number
  ): Promise<boolean> {
    const whereClause: any = {
      id: { [Op.ne]: excludeUserId }
    };

    const orConditions: any[] = [];
    if (data.email) {
      orConditions.push({ email: data.email });
    }
    if (data.phoneNumber) {
      orConditions.push({ phoneNumber: data.phoneNumber });
    }

    if (orConditions.length > 0) {
      whereClause[Op.or] = orConditions;
    }

    const user = await Model.User.findOne({ where: whereClause });
    return !!user;
  }


  async findByIdAsync(id: number): Promise<User | null> {
    const user = await Model.User.findByPk(id);
    return user ? (user.get({ plain: true }) as User) : null;
  }

  // In UserRepository.ts
  async updateProfileAsync(
    userId: number,
    data: Partial<Pick<User, 'fullName' | 'phoneNumber' | 'aboutMe' | 'image' | 'lang'>>
  ): Promise<User | null> {
    const user = await Model.User.findByPk(userId);
    if (!user) return null;

    await user.update(data);
    const plainUser = user.get({ plain: true }) as User;
    const { password, ...safeUser } = plainUser;
    return safeUser;
  }

  async createAsync(data: CreateUserInput): Promise<Omit<User, 'password'>> {
    const user = await Model.User.create(data);
    const plainUser = user.get({ plain: true }) as User;

    // Destructure to remove password
    const { password, ...userWithoutPassword } = plainUser;
    return userWithoutPassword;
  }

  async checkIfUserExists({ email, phoneNumber, id }: CheckUserParams): Promise<boolean> {
    const where: any = {};
    if (email) where.email = email;
    if (id) where.id = id;
    if (phoneNumber) where.phoneNumber = phoneNumber;
    const user = await Model.User.findOne({ where });
    return !!user; // true if user exists, false otherwise
  }

  async findExistingUser({ email, phoneNumber, id }: CheckUserParams): Promise<any> {
    const where: any = {};
    if (email) where.email = email;
    if (id) where.id = id;
    if (phoneNumber) where.phoneNumber = phoneNumber;
    const user = await Model.User.findOne({
      where,
    });
    return user; // true if user exists, false otherwise
  }

  async updateUser({ email, phoneNumber, password }: UpdateUserParams, { id }: CheckUserParams): Promise<boolean> {
    const payload: any = {};
    if (email) payload.email = email;
    if (password) payload.password = password;
    if (phoneNumber) payload.phoneNumber = phoneNumber;

    const where: any = {};
    if (email) where.email = email;
    if (id) where.id = id;
    if (phoneNumber) where.phoneNumber = phoneNumber;

    const user = await Model.User.update(payload, { where });
    return !!user; // true if user exists, false otherwise
  }

  async checkIfOTPExists({ email, phoneNumber }: CheckUserParams): Promise<boolean> {
    const where: any = {};
    if (email) where.email = email;
    if (phoneNumber) where.phoneNumber = phoneNumber;
    const user = await Model.OTP.findOne({ where });
    return !!user; // true if user exists, false otherwise
  }


  async checkOTP({ email, phoneNumber }: CheckUserParams): Promise<OTP | unknown> {
    const where: any = {};
    if (email) where.email = email;
    if (phoneNumber) where.phoneNumber = phoneNumber;
    return await Model.OTP.findOne({ where });
  }

  async createOrUpdateOTP(isExist: boolean, payload: CreateOTPInput, { email, phoneNumber }: CheckUserParams): Promise<any> {
    if (isExist) {
      // Update existing record
      return await Model.OTP.update(payload, {
        where: email ? { email } : { phoneNumber },
      });
    }
    // Create new record
    return await Model.OTP.create(payload);
  }

   /**
   * Update user by ID
   */
  async updateAsync(userId: number, data: any): Promise<User | null> {
    await Model.User.update(data, {
      where: { id: userId }
    });

    const updatedUser = await Model.User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    return updatedUser as User | null;
  }

  /**
   * Delete user by ID
   * Returns true if deletion was successful
   */
  async deleteAsync(userId: number): Promise<boolean> {
    // Option 1: Hard delete
    const deleted = await Model.User.destroy({
      where: { id: userId }
    });

    // Option 2: Soft delete (recommended - uncomment to use)
    // await Model.User.update(
    //   { deletedAt: new Date(), status: 'deleted' },
    //   { where: { id: userId } }
    // );
    // return true;

    return deleted > 0;
  }

}
