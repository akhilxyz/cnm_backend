import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { adminService } from "./admin.service";

class AdminController {

  public login: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await adminService.login(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

    public dashboardData: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await adminService.dashboardData();
    return handleServiceResponse(serviceResponse, res);
  };
}

export const adminController = new AdminController();
