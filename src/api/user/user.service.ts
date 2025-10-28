import { StatusCodes } from "http-status-codes";
import { UserRepository } from "@/api/user/user.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { changePasswordRequest, CreateUserByAdminRequest, login, loginRequest, OTP, otpRequest, RegisterRequest, UpdateUserRequest, User } from "@/interface/user.interface";
import { compareHash, createJwtToken, encryptData, requestOTPPayload, validateOTP, validateRequestType, verifyGoogleToken, verifyJwtToken } from "@/common/utils/commonValidation";
import { logger } from "@/server";
import { sendResetPasswordEmail } from "@/services/mail.service";

  export class UserService {
    private userRepository: UserRepository;

    constructor(repository: UserRepository = new UserRepository()) {
      this.userRepository = repository;
    }

    

    // Retrieves all users from the database
    async findAll(page: number, limit: number, search: string): Promise<ServiceResponse<User[] | null>> {
      try {
        const users: any = await this.userRepository.findAllAsync(page, limit, search);
        if (!users || users.length === 0) {
          return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
        }
        return ServiceResponse.success<User[]>("Users found", users);
      } catch (ex) {
        const errorMessage = `Error finding all users: $${(ex as Error).message}`;
        logger.error(errorMessage);
        return ServiceResponse.failure(
          "An error occurred while retrieving users.",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
    }

  // Retrieves a single user by their ID
  async findById(id: number): Promise<ServiceResponse<User | null>> {
    try {
      const user = await this.userRepository.findByIdAsync(id);
      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User>("User found", user);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createUser(data: RegisterRequest): Promise<ServiceResponse<User | null>> {
    try {
      const checkIfUserExists = await this.userRepository.checkIfUserExists(data);
      if (checkIfUserExists) {
        return ServiceResponse.failure("Email already exit", null, StatusCodes.CONFLICT);
      }
      /*  const otpUser: any = await this.userRepository.checkOTP(data);
       if (!otpUser) {
         return ServiceResponse.failure("Invalid OTP", null, StatusCodes.BAD_REQUEST);
       }
       const { isValid, message }: any = await validateOTP(data.otp, otpUser.otpHash, otpUser.expiresAt);
       if (!isValid) {
         return ServiceResponse.failure(message, null, StatusCodes.BAD_REQUEST);
       } */
      data.password = await encryptData(data.password || '');
      const newUser: any = await this.userRepository.createAsync(data);
      const authToken = createJwtToken({ id: newUser.id });
      newUser.token = authToken;
      return ServiceResponse.success<User>("User created successfully", newUser);
    } catch (ex) {
      logger.error("Error creating user:", ex);
      return ServiceResponse.failure<User | null>(
        "Failed to create user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async loginRequest(data: loginRequest): Promise<ServiceResponse<any>> {
    try {
      const newUser = await this.userRepository.checkIfUserExists(data);
      const result = validateRequestType(data.loginWith, newUser)
      return ServiceResponse.success<any>("login request sent successfully", result);
    } catch (ex) {
      logger.error("Error login request:", ex);
      return ServiceResponse.failure<User | null>(
        "Failed to send login request",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async otpRequest(data: loginRequest): Promise<ServiceResponse<any>> {
    try {
      const otpUser = await this.userRepository.checkIfOTPExists(data);
      const { payload, dataObj }: any = await requestOTPPayload(data);
      await this.userRepository.createOrUpdateOTP(otpUser, payload, dataObj);
      return ServiceResponse.success<any>("otp sent successfully", null);
    } catch (ex) {
      console.log("Error otp request:", ex);
      return ServiceResponse.failure<User | null>(
        "Failed to send otp",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async otpVerify(data: otpRequest): Promise<ServiceResponse<any>> {
    try {
      const otpUser: any = await this.userRepository.checkOTP(data);
      if (!otpUser) {
        return ServiceResponse.failure("Invalid OTP", null, StatusCodes.BAD_REQUEST);
      }
      const { isValid, message }: any = await validateOTP(data.otp, otpUser.otpHash, otpUser.expiresAt);
      if (!isValid) {
        return ServiceResponse.failure(message, null, StatusCodes.BAD_REQUEST);
      }
      return ServiceResponse.success<any>("otp verify successfully", null);
    } catch (ex) {
      logger.error("Error otp verification", ex);
      return ServiceResponse.failure<OTP | null>(
        "otp verification failed",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Helper function to create a user and generate token
  async createUserAndGenerateToken(userData: any) {
    const newUser = await this.userRepository.createAsync(userData);
    return createJwtToken({ id: newUser.id });
  };

  async login(data: login): Promise<ServiceResponse<any>> {
    try {
      const user: any = await this.userRepository.findExistingUser(data);
      let authToken: string | null = null;
      let finalUser: any = user;

      if (data.loginWith === 'email') {
        if (!user || !data.password) {
          return ServiceResponse.failure('User is not registered', null, StatusCodes.NOT_FOUND);
        }

        const isPasswordValid = await compareHash(data.password, user.password);
        if (!isPasswordValid) {
          return ServiceResponse.failure('Invalid password', null, StatusCodes.UNAUTHORIZED);
        }

        authToken = createJwtToken({ id: user.id ,  role: user?.role ?? "USER" });

      } else if (data.loginWith === 'phone') {
        if (!data.otp) {
          return ServiceResponse.failure('OTP is required', null, StatusCodes.BAD_REQUEST);
        }

        const otpUser: any = await this.userRepository.checkOTP(data);
        if (!otpUser) {
          return ServiceResponse.failure('Invalid OTP', null, StatusCodes.BAD_REQUEST);
        }

        const { isValid, message }: any = await validateOTP(data.otp, otpUser.otpHash, otpUser.expiresAt);
        if (!isValid) {
          return ServiceResponse.failure(message, null, StatusCodes.BAD_REQUEST);
        }

        if (!user) {
          const userObj: any = {
            fullName: 'User',
            phoneNumber: data.phoneNumber,
            isPhoneVerified: true,
            isActive: true,
            loginWith: 'phone',
          };
          finalUser = await this.userRepository.createAsync(userObj);
        }

        authToken = createJwtToken({ id: finalUser.id });

      } else if (data.token) {
        const userInfo = await verifyGoogleToken(data.token);
        if (!userInfo || !userInfo.email_verified) {
          return ServiceResponse.failure('Invalid Gmail token', null, StatusCodes.BAD_REQUEST);
        }

        if (!user) {
          const userObj: any = {
            fullName: userInfo?.name ?? 'user',
            email: userInfo.email,
            linkedAccount: data.token ?? null,
            isEmailVerified: true,
            isActive: true,
            loginWith: 'gmail',
          };
          finalUser = await this.userRepository.createAsync(userObj);
        }
        authToken = createJwtToken({ id: finalUser.id, role: finalUser?.role ?? "USER" });

      } else {
        return ServiceResponse.failure('Invalid login method', null, StatusCodes.BAD_REQUEST);
      }

      // Remove sensitive fields
      const { password, otp, otpHash, ...safeUser } = finalUser?.get?.({ plain: true }) ?? finalUser;

      return ServiceResponse.success('Login successfully', {
        token: authToken,
        user: safeUser,
      });

    } catch (ex) {
      logger.error('Error during login:', ex);
      return ServiceResponse.failure('Login failed', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }



  async forgotPassword(data: otpRequest): Promise<ServiceResponse<any>> {
    try {
      // Check if user exists for email or phone login
      const user: any = await this.userRepository.findExistingUser(data);
      let authToken = null;
      if (!user) {
        return ServiceResponse.failure('User is not registered', null, StatusCodes.NOT_FOUND);
      }

      const otpUser: any = await this.userRepository.checkOTP(data);
      if (!otpUser) {
        return ServiceResponse.failure("Invalid OTP", null, StatusCodes.BAD_REQUEST);
      }
      const { isValid, message }: any = await validateOTP(data.otp, otpUser.otpHash, otpUser.expiresAt);
      if (!isValid) {
        return ServiceResponse.failure(message, null, StatusCodes.BAD_REQUEST);
      }

      authToken = createJwtToken({ id: user.id });

      return ServiceResponse.success('email verified successfully', { token: authToken, action: "REQUEST_NEW_PASSWORD" });

    } catch (ex) {
      logger.error('Error during forgot password:', ex);
      return ServiceResponse.failure('forgot password failed', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async forgotPasswordLink(data: { email: string }): Promise<ServiceResponse<any>> {
    try {
      // Check if user exists for email or phone login
      const user: any = await this.userRepository.findExistingUser(data);
      let authToken = null;
      if (!user) {
        return ServiceResponse.failure('User is not registered', null, StatusCodes.NOT_FOUND);
      }
      const resetBaseUrl = process.env.RESET_PASSWORD_URL || 'http://localhost:5173/reset-password';
      authToken = createJwtToken({ id: user.id });

      const fullResetLink = `${resetBaseUrl}?token=${authToken}`;
      const result = await sendResetPasswordEmail(user.email, fullResetLink);

      if (!result.success) {
        return ServiceResponse.failure('Failed to send reset email', result.error, StatusCodes.INTERNAL_SERVER_ERROR);
      }
      return ServiceResponse.success('link sent successfully', null);

    } catch (ex) {
      logger.error('Error during forgot password:', ex);
      return ServiceResponse.failure('forgot password failed', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async changePassword(data: changePasswordRequest): Promise<ServiceResponse<any>> {
    try {
      // Check if user exists for email or phone login

      const verifyToken = verifyJwtToken(data.token)

      if (!verifyToken?.id) {
        return ServiceResponse.failure('invalid token', null, StatusCodes.NOT_FOUND);
      }

      const user: any = await this.userRepository.checkIfUserExists({ id: verifyToken.id });

      if (!user) {
        return ServiceResponse.failure('User is not registered', null, StatusCodes.NOT_FOUND);
      }

      const password = await encryptData(data.password);

      await this.userRepository.updateUser({ password }, { id: verifyToken.id })

      return ServiceResponse.success('password changed successfully', null);

    } catch (ex) {
      logger.error('Error during change password:', ex);
      return ServiceResponse.failure('change password failed', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async getProfile(userId: number): Promise<ServiceResponse<User | null>> {
    try {
      const user: any = await this.userRepository.findByIdAsync(userId);
      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }
      /* if (user.role === 'seller') {
        const sellerProfile = await this.userRepository.sellerFindByIdAsync(userId);
        if (!sellerProfile) {
          return ServiceResponse.failure("Seller profile not found", null, StatusCodes.NOT_FOUND);
        }
        return ServiceResponse.success<User>("Seller profile fetched successfully", sellerProfile);
      } */
      // Remove sensitive fields
      const { password, ...safeUser } = user;
      return ServiceResponse.success<User>("User profile fetched successfully", safeUser);
    } catch (ex) {
      logger.error("Error fetching user profile:", ex);
      return ServiceResponse.failure("An error occurred while fetching user profile.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  async getUserProfile(userId: number): Promise<ServiceResponse<User | null>> {
    try {
      /* const user: any = await this.userRepository.sellerFindByIdAsync(userId);
      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }
      // Remove sensitive fields
      const { password, ...safeUser } = user; */
      return ServiceResponse.success<null>("User profile fetched successfully", null);
    } catch (ex: any) {
      console.log("Error fetching user profile:", ex);
      logger.error("Error fetching user profile:", ex?.message);
      return ServiceResponse.failure("An error occurred while fetching user profile.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  // In your user.service.ts or user.controller.ts

  async updateProfile(userId: number, updateData: Partial<User>): Promise<ServiceResponse<User | null>> {
    try {
      const user = await this.userRepository.updateProfileAsync(userId, updateData);

      if (!user) {
        return ServiceResponse.failure('User not found', null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<User>('Profile updated successfully', user);
    } catch (error) {
      logger.error('Error updating profile:', error);
      return ServiceResponse.failure('An error occurred while updating profile.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async betaRequest(updateData: { email: string }): Promise<ServiceResponse<User | null>> {
    try {

      /* const isBetaRequestExist: any = await this.userRepository.checkBetaRequestExist(updateData.email)
      if (isBetaRequestExist) {
        return ServiceResponse.success('Beta request already received.', null);
      } */
      // await this.userRepository.createBetaRequest(updateData.email)
      return ServiceResponse.success<null>('Beta request sent successfully', null);
    } catch (error) {
      logger.error('Error sending Beta request', error);
      return ServiceResponse.failure('An error occurred while sending beta request', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  /**
   * Admin creates a new user (bypasses OTP verification)
   */
  async createUserByAdmin(data: CreateUserByAdminRequest): Promise<ServiceResponse<User | null>> {
    try {
      // Validate required fields
      if (!data.fullName || !data.loginWith) {
        return ServiceResponse.failure(
          "fullName and loginWith are required fields",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      // Validate loginWith-specific fields
      if (data.loginWith === 'email' && !data.email) {
        return ServiceResponse.failure(
          "Email is required when loginWith is 'email'",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      if (data.loginWith === 'phone' && !data.phoneNumber) {
        return ServiceResponse.failure(
          "Phone number is required when loginWith is 'phone'",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      // Check if user already exists
      const checkIfUserExists = await this.userRepository.checkIfUserExists(data);
      if (checkIfUserExists) {
        return ServiceResponse.failure(
          "User with this email or phone already exists",
          null,
          StatusCodes.CONFLICT
        );
      }

      // Encrypt password if provided
      if (data.password) {
        data.password = await encryptData(data.password);
      }

      // Create user without OTP verification (admin bypass)
      const newUser: any = await this.userRepository.createAsync(data);
      
      // Remove sensitive data from response
      delete newUser.password;

      return ServiceResponse.success<User>("User created successfully by admin", newUser);
    } catch (ex) {
      const errorMessage = `Error creating user by admin: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure<User | null>(
        "Failed to create user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update user by ID
   */
  async updateUser(userId: number, data: UpdateUserRequest): Promise<ServiceResponse<User | null>> {
    try {
      if (!userId) {
        return ServiceResponse.failure("User ID is required", null, StatusCodes.BAD_REQUEST);
      }

      // Check if user exists
      const existingUser = await this.userRepository.findByIdAsync(userId);
      if (!existingUser) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }

      // Check for duplicate email/phone if being updated
      if (data.email || data.phoneNumber) {
        const duplicateCheck = await this.userRepository.checkIfUserExistsExcludingId(
          { email: data.email, phoneNumber: data.phoneNumber },
          userId
        );
        if (duplicateCheck) {
          return ServiceResponse.failure(
            "Email or phone number already in use by another user",
            null,
            StatusCodes.CONFLICT
          );
        }
      }

      // Encrypt password if being updated
      if (data.password) {
        data.password = await encryptData(data.password);
      }

      // Update user
      const updatedUser: any = await this.userRepository.updateAsync(userId, data);
      
      if (!updatedUser) {
        return ServiceResponse.failure(
          "Failed to update user",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      // Remove sensitive data from response
      delete updatedUser.password;

      return ServiceResponse.success<User>("User updated successfully", updatedUser);
    } catch (ex) {
      const errorMessage = `Error updating user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure<User | null>(
        "Failed to update user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete user by ID
   */
  async deleteUser(userId: number): Promise<ServiceResponse<null>> {
    try {
      if (!userId) {
        return ServiceResponse.failure("User ID is required", null, StatusCodes.BAD_REQUEST);
      }

      // Check if user exists
      const existingUser = await this.userRepository.findByIdAsync(userId);
      if (!existingUser) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }

      // Perform deletion
      const deleted = await this.userRepository.deleteAsync(userId);

      if (!deleted) {
        return ServiceResponse.failure(
          "Failed to delete user",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      return ServiceResponse.success<null>("User deleted successfully", null);
    } catch (ex) {
      const errorMessage = `Error deleting user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure<null>(
        "Failed to delete user",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const userService = new UserService();
