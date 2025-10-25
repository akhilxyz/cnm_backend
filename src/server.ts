import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import errorHandler from "@/common/middleware/errorHandler";
// import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
// import { checkCORSOrigin } from "@/common/utils/corsHandler";
import { setupAutoRoutes } from "@/common/utils/loadRoutes";
import hpp from "hpp";
import { userRouter } from "./api/user/user.router";
// import bodyParser from "body-parser";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);


// ✅ Middlewares
app.use(helmet());
app.use(hpp());
// app.use(cors({ origin: checkCORSOrigin(), credentials: true }));
app.use(cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

// ❌ Do not use bodyParser or duplicate express.json()

// ✅ Routes
setupAutoRoutes(app);
app.use(userRouter);

// ✅ Error Handlers
app.use(...errorHandler());

// ✅ Swagger Docs
app.use(openAPIRouter);



export { app, logger };
