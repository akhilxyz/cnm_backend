import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { platformService } from "./platform.service";

class PlatformController {
  public isConnected: RequestHandler = async (req: Request, res: Response) => {
    const {platform} = req?.params || ''
    const userId = (req as any).user.id;
    const serviceResponse = await platformService.isConnected(platform, userId);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const platformController = new PlatformController();
