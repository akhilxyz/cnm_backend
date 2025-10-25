import { AdminRepository } from "@/api/admin/admin.repository";
import { UserRepository } from "../user/user.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import { compareHash, createJwtToken } from "@/common/utils/commonValidation";
import { loginWithEmail } from "@/interface/user.interface";
import Model from "@/db/models";

export class AdminService {
  private adminRepository: AdminRepository;
  private userRepository: UserRepository

  constructor(repository: AdminRepository = new AdminRepository(), userRepository: UserRepository = new UserRepository()) {
    this.adminRepository = repository;
    this.userRepository = userRepository
  }


  async login(data: loginWithEmail): Promise<ServiceResponse<any>> {
    try {

      // Check if user exists
      const user = await this.userRepository.findExistingUser(data);
      if (!user || user.role !== 'ADMIN') {
        return ServiceResponse.failure('Invalid user', null, StatusCodes.NOT_FOUND);
      }

      // Verify password
      const isPasswordValid = await compareHash(data.password, user.password);
      if (!isPasswordValid) {
        return ServiceResponse.failure('Invalid password', null, StatusCodes.UNAUTHORIZED);
      }
      // Generate token
      const token = createJwtToken({ id: user.id, role: 'ADMIN' });
      return ServiceResponse.success('Login successfully', { token });
    } catch (error) {
      logger.error('Error during login:', error);
      return ServiceResponse.failure('Login failed', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  async dashboardData(): Promise<ServiceResponse<any>> {
  try {
    const [totalComment, totalBlog] = await Promise.all([
      Model.Comment.count(),
      Model.Blog.count(),
    ]);

    const totalCategory = 20; // replace with dynamic count if needed

    return ServiceResponse.success('dashboard data successfully', {
      totalComment,
      totalBlog,
      totalCategory,
    });
  } catch (error) {
    logger.error('Error during dashboard data fetch:', error);
    return ServiceResponse.failure('Dashboard fetch failed', null, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

}

export const adminService = new AdminService();
