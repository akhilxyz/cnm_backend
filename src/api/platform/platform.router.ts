import express, { type Router } from "express";
import { platformController } from "./platform.controller";
import { authenticateToken } from "@/common/middleware/auth";

export const platformRouter: Router = express.Router();

// platformRoutes
platformRouter.get("/connected/:platform", authenticateToken, platformController.isConnected);

// userRouter.post("/login", validateRequest(LoginSchema), userController.login);