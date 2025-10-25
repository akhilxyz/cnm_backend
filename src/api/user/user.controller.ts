import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { userService } from "@/api/user/user.service";

class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const page = parseInt(_req.query.page as string) || 1;
    const limit = parseInt(_req.query.limit as string) || 10;  
    const search = _req?.query?.search?.toString() || ''
    const serviceResponse = await userService.findAll(page, limit, search);
    return handleServiceResponse(serviceResponse, res);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const serviceResponse = await userService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createUser: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.createUser(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public loginRequest: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.loginRequest(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public otpRequest: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.otpRequest(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public otpVerify: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.otpVerify(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public login: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.login(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public forgotPassword: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.forgotPassword(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public forgotPasswordLink: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.forgotPasswordLink(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public changePassword: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.changePassword(req.body);
    return handleServiceResponse(serviceResponse, res);
  };
  public getProfile: RequestHandler = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const serviceResponse = await userService.getProfile(userId);
    return handleServiceResponse(serviceResponse, res);
  };

   public getUserProfile: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const serviceResponse = await userService.getUserProfile(id);
    return handleServiceResponse(serviceResponse, res);
  };

   public updateProfile: RequestHandler = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const serviceResponse = await userService.updateProfile(userId, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

    public betaRequest: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.betaRequest(req.body);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const userController = new UserController();
