import express, { type Router } from "express";
import { validateRequest } from "@/common/utils/httpHandlers";
import { LoginAdminSchema } from "@/api/admin/admin.schema";
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

// admin operations
// adminRouter.post("/category/create", authenticateAdminToken, validateRequest(CreateCategorySchema), categoryController.createCategory);
// adminRouter.delete("/category/:id", authenticateAdminToken, categoryController.deleteCategory);
