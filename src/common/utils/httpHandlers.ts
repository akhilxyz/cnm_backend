import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ObjectSchema } from 'joi';
import { ServiceResponse } from "@/common/models/serviceResponse";

export const handleServiceResponse = (serviceResponse: ServiceResponse<any>, response: Response) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

type JoiSchemaGroup = {
  body?: ObjectSchema;                               
  query?: ObjectSchema;
  params?: ObjectSchema;
};

export const validateRequest = (schemas: JoiSchemaGroup) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validations = [
    { key: 'body', schema: schemas.body },
    { key: 'query', schema: schemas.query },
    { key: 'params', schema: schemas.params },
  ];

  for (const { key, schema } of validations) {
    if (schema) {
      const original = (req as any)[key];

      const { error } = schema.validate(original, {
        abortEarly: false,
        allowUnknown: false,
      });

      if (error) {
        const detailedErrors = error.details.map((e: any) => {
          const field = e.path.join('.');
          const message = e.message.replace(/["]/g, '');
          return `${field}: ${message}`;
        });

        const errorMessage = `${detailedErrors.join(', ')}`;
        const statusCode = StatusCodes.BAD_REQUEST;
        const serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
        return handleServiceResponse(serviceResponse, res);
      }
    }
  }

  next();
};
