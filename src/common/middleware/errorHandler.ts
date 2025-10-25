import type { ErrorRequestHandler, RequestHandler } from "express";
import { ServiceResponse } from "../models/serviceResponse";
import { handleServiceResponse } from "../utils/httpHandlers";
import multer from "multer";
import { StatusCodes } from "http-status-codes";

/**
 * Logs all errors to res.locals
 */
const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
  res.locals.err = err;
  next(err);
};

/**
 * Handles bad JSON syntax errors
 */
const syntaxErrorRequest: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    const serviceResponse = ServiceResponse.failure("Invalid JSON syntax", null);
    return handleServiceResponse(serviceResponse, res);
  }
  next(err);
};

/**
 * Handles CORS-related errors
 */
const corsErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err.message?.includes("CORS")) {
    const serviceResponse = ServiceResponse.failure(
      "CORS error: Not allowed by CORS policy",
      null,
      StatusCodes.FORBIDDEN
    );
    return handleServiceResponse(serviceResponse, res);
  }
  next(err);
};

/**
 * Handles unexpected routes (404 Not Found)
 */
const unexpectedRouteRequest: RequestHandler = (req, res) => {
  const serviceResponse = ServiceResponse.failure(
    `Route not found: ${req.method} ${req.originalUrl}`,
    null,
    StatusCodes.NOT_FOUND
  );
  return handleServiceResponse(serviceResponse, res);
};

/**
 * Handles multer (file upload) errors
 */
export const multerErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let message = "Something went wrong";
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File too large. Max allowed size is 5MB.";
        statusCode = StatusCodes.BAD_REQUEST;
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Too many files uploaded. Max allowed is 5 images.";
        statusCode = StatusCodes.BAD_REQUEST;
        break;
      default:
        message = "File upload error";
        statusCode = StatusCodes.BAD_REQUEST;
    }
  } else if (err.message === "Unsupported file format. Allowed: JPG, PNG, WEBP") {
    message = err.message;
    statusCode = StatusCodes.BAD_REQUEST;
  }

  const serviceResponse = ServiceResponse.failure(message, null, statusCode);
  return handleServiceResponse(serviceResponse, res);
};

/**
 * Handles validation library errors (e.g. zod, express-validator, joi)
 */
const validationErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err.name === "ValidationError" || err.name === "ZodError") {
    const message = err.message || "Validation failed";
    const serviceResponse = ServiceResponse.failure(message, err.errors || null, StatusCodes.BAD_REQUEST);
    return handleServiceResponse(serviceResponse, res);
  }

  next(err);
};

/**
 * Handles TypeErrors (useful in dev)
 */
const typeErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof TypeError) {
    const serviceResponse = ServiceResponse.failure("A type error occurred", err.message, StatusCodes.BAD_REQUEST);
    return handleServiceResponse(serviceResponse, res);
  }
  next(err);
};

/**
 * Final fallback for unhandled errors
 */
const genericErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const message = process.env.NODE_ENV === "development" ? err.message : "Internal Server Error";
  const serviceResponse = ServiceResponse.failure(message, null, StatusCodes.INTERNAL_SERVER_ERROR);
  return handleServiceResponse(serviceResponse, res);
};


export default () => [
  typeErrorHandler,
  genericErrorHandler,
  validationErrorHandler,
  corsErrorHandler,         // check cors
  unexpectedRouteRequest,   // 404 for unregistered routes
  syntaxErrorRequest,       // handle SyntaxErrors
  addErrorToRequestLog,     // attach to res.locals.err
  multerErrorHandler,
];