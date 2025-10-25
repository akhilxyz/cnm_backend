import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Request, type Response, type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import os from "os";

export const healthCheckRegistry = new OpenAPIRegistry();
export const healthCheckRouter: Router = express.Router();

healthCheckRegistry.registerPath({
  method: "get",
  path: "/health-check",
  tags: ["Health Check"],
  responses: createApiResponse(z.null(), "Success"),
});

const serverInfo = {
  status: "ok",
  timestamp: new Date().toISOString(),
  uptimeSeconds: process.uptime(),
  memoryUsageMB: {
    total: (os.totalmem() / 1024 / 1024).toFixed(2),
    free: (os.freemem() / 1024 / 1024).toFixed(2),
  },
  cpuCount: os.cpus().length,
  platform: os.platform(),
  nodeVersion: process.version,
};

healthCheckRouter.get("/", (_req: Request, res: Response) => {
  const serviceResponse = ServiceResponse.success("Service is healthy", serverInfo);
  return handleServiceResponse(serviceResponse, res);
});
