import express, { type Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "@/common/utils/httpHandlers";
import { changePasswordSchema, forgotPasswordLinkSchema, forgotPasswordSchema, LoginRequestSchema, LoginSchema, OTPRequestSchema, registerRequestSchema } from "@/api/user/user.schema";
import { authenticateToken } from "@/common/middleware/auth";

export const userRouter: Router = express.Router();

// userRoutes
userRouter.post("/register", validateRequest(registerRequestSchema), userController.createUser);
userRouter.post("/login", validateRequest(LoginSchema), userController.login);

userRouter.post("/login-request", validateRequest(LoginRequestSchema), userController.loginRequest);
userRouter.post("/otp-request", validateRequest(LoginRequestSchema), userController.otpRequest);
userRouter.post("/otp-verify", validateRequest(OTPRequestSchema), userController.otpVerify);
userRouter.post("/forgot-password", validateRequest(forgotPasswordSchema), userController.forgotPassword);
userRouter.post("/forgot-password-link", validateRequest(forgotPasswordLinkSchema), userController.forgotPasswordLink);

userRouter.post("/change-password", validateRequest(changePasswordSchema), userController.changePassword);
// userRouter.post("/register", validateRequest(registerRequestSchema), userController.createUser);

// profile 
userRouter.get("/profile",  authenticateToken, userController.getProfile);
userRouter.get("/profile/:id", userController.getUserProfile);
userRouter.put("/profile",  authenticateToken, userController.updateProfile);

// BetaAccess
userRouter.post("/beta-access-request", userController.betaRequest);
