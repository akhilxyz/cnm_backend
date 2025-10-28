import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { adminService } from "./admin.service";
import { userService } from "../user/user.service";

class AdminController {

  public login: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await adminService.login(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

    public dashboardData: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await adminService.dashboardData();
    return handleServiceResponse(serviceResponse, res);
  };

   /**
   * Admin endpoint to create a new user
   * POST /admin/users/create
   */
  public createUserByAdmin: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.createUserByAdmin(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  /**
   * Admin endpoint to update an existing user
   * PUT /admin/users/:id
   */
  public updateUser: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const serviceResponse = await userService.updateUser(Number(userId), req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  /**
   * Admin endpoint to delete a user
   * DELETE /admin/users/:id
   */
  public deleteUser: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const serviceResponse = await userService.deleteUser(Number(userId));
    return handleServiceResponse(serviceResponse, res);
  };

  /**
   * Admin endpoint to get all users with pagination and search
   * GET /admin/users
   */
  public getAllUsers: RequestHandler = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    
    const serviceResponse = await userService.findAll(page, limit, search);
    return handleServiceResponse(serviceResponse, res);
  };

  /**
   * Admin endpoint to get a single user by ID
   * GET /admin/users/:id
   */
  public getUserById: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const serviceResponse = await userService.findById(Number(userId));
    return handleServiceResponse(serviceResponse, res);
  };
}

export const adminController = new AdminController();
