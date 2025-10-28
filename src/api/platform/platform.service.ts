import { StatusCodes } from "http-status-codes";
import { UserRepository } from "@/api/user/user.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { WhatsAppAccountRepository } from "../whatsapp/repositories/whatsAppAccount.repository";

export class PlatformService {
  private userRepository: UserRepository;
  private whatsAppAccountRepository: WhatsAppAccountRepository;

  constructor(repository: UserRepository = new UserRepository(),
    whatsAppAccountRepository: WhatsAppAccountRepository = new WhatsAppAccountRepository()
  ) {
    this.userRepository = repository;
    this.whatsAppAccountRepository = whatsAppAccountRepository
  }

  // Retrieves all users from the database
  async isConnected(
  platform: string,
  userId: number
): Promise<ServiceResponse<any | null>> {
  try {
    const user = await this.userRepository.findByIdAsync(userId);

    if (!user) {
      return ServiceResponse.failure("No user found", null, StatusCodes.NOT_FOUND);
    }

    const platformKey = platform.toLowerCase();

    switch (platformKey) {
      case "whatsapp": {
        const whatsappAccount = await this.whatsAppAccountRepository.findByUserIdAsync(user.id);
        return ServiceResponse.success("WhatsApp account", {
          isFound: !!whatsappAccount,
          data: whatsappAccount ?? null,
        });
      }

      // future platforms
      // case "facebook": ...

      default:
        return ServiceResponse.failure("Platform not found", null, StatusCodes.NOT_FOUND);
    }
  } catch (ex) {
    const errorMessage = `Error checking platform connection: ${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while checking platform connection.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}


  async isPlatformConnected(
  userId: number
): Promise<ServiceResponse<any | null>> {
  try {
    const user = await this.userRepository.findByIdAsync(userId);

    if (!user) {
      return ServiceResponse.failure("No user found", null, StatusCodes.NOT_FOUND);
    }
    const platformKey = "whatsapp"
    switch (platformKey) {
      case "whatsapp": {
        const whatsappAccount = await this.whatsAppAccountRepository.findByUserIdAsync(user.id);
        return ServiceResponse.success("WhatsApp account", {
          isFound: !!whatsappAccount,
          data: whatsappAccount ?? null,
        });
      }

      // future platforms
      // case "facebook": ...

      default:
        return ServiceResponse.failure("Platform not found", null, StatusCodes.NOT_FOUND);
    }
  } catch (ex) {
    const errorMessage = `Error checking platform connection: ${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while checking platform connection.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

}

export const platformService = new PlatformService();
