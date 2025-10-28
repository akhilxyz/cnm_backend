import express, { type Router } from "express";
import { validateRequest } from "@/common/utils/httpHandlers";
import { CreateUserByAdminSchema, LoginAdminSchema } from "@/api/admin/admin.schema";
import { adminController } from "./admin.controller";
import { authenticateAdminToken } from "@/common/middleware/auth";
// import { CreateCategorySchema } from "../category/category.schema";
// import { categoryController } from "../category/category.controller";
import { userController } from "../user/user.controller";

export const adminRouter: Router = express.Router();

// AdminRoutes
adminRouter.post("/login", validateRequest(LoginAdminSchema), adminController.login);
adminRouter.get("/users/list", authenticateAdminToken, userController.getUsers);
adminRouter.get("/dashboard-data",authenticateAdminToken , adminController.dashboardData);

// create user by admin
adminRouter.post("/users/create", validateRequest(CreateUserByAdminSchema), authenticateAdminToken, adminController.createUserByAdmin);
adminRouter.put("/users/:id", authenticateAdminToken, adminController.updateUser);
adminRouter.delete("/users/:id", authenticateAdminToken, adminController.deleteUser);