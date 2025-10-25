// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { UserJwtPayload } from '@/common/types/express';
import { ServiceResponse } from '../models/serviceResponse';
import { StatusCodes } from 'http-status-codes';
import { handleServiceResponse } from '../utils/httpHandlers';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader: any = req.headers['api-access-token'];
    const token = authHeader ?? null;

    if (!token) {
        const serviceResponse = ServiceResponse.failure(
            "unauthorized user",
            null,
            StatusCodes.UNAUTHORIZED,
        );
        return handleServiceResponse(serviceResponse, res);
    }

    try {
        const user = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as UserJwtPayload;

        req.user = user;
        next();
    } catch (err) {
        return jwtErrorHandler(err, res)
    }
}



export function publicAuthenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader: any = req.headers['api-access-token'];
    const token = authHeader ?? null;
    if (!token) {
        next();
        return;
    }

    try {
        const user = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as UserJwtPayload;

        req.user = user;
        next();
    } catch (err) {
        return jwtErrorHandler(err, res)
    }
}


export function authenticateSeller(req: Request, res: Response, next: NextFunction) {
    const authHeader: any = req.headers['api-access-token'];
    const token = authHeader ?? null;

    if (!token) {
        const serviceResponse = ServiceResponse.failure(
            "unauthorized user",
            null,
            StatusCodes.UNAUTHORIZED,
        );
        return handleServiceResponse(serviceResponse, res);
    }
    try {
        const user = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as UserJwtPayload;
        if (!user.role || user.role?.toLowerCase() !== 'seller') {
            const serviceResponse = ServiceResponse.failure(
                "unauthorized user",
                null,
                StatusCodes.UNAUTHORIZED,
            );
            return handleServiceResponse(serviceResponse, res);
        }
        req.user = user;
        next();
    } catch (err) {
        return jwtErrorHandler(err, res)
    }
}


export function authenticateAdminToken(req: Request, res: Response, next: NextFunction) {
    const authHeader: any = req.headers['api-access-token'];
    const token = authHeader ?? null;

    if (!token) {
        const serviceResponse = ServiceResponse.failure(
            "unauthorized user",
            null,
            StatusCodes.UNAUTHORIZED,
        );
        return handleServiceResponse(serviceResponse, res);
    }
    try {
        const user = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as UserJwtPayload;
        if (!user.role || user.role !== 'ADMIN') {
            const serviceResponse = ServiceResponse.failure(
                "unauthorized user",
                null,
                StatusCodes.UNAUTHORIZED,
            );
            return handleServiceResponse(serviceResponse, res);
        }
        req.user = user;
        next();
    } catch (err) {
        return jwtErrorHandler(err, res)
    }
}

function jwtErrorHandler(err: any, res : Response) {
    if (err instanceof TokenExpiredError) {
        const serviceResponse = ServiceResponse.failure(
            "token expired",
            null,
            StatusCodes.UNAUTHORIZED,
        );
        return handleServiceResponse(serviceResponse, res);
    }

    const serviceResponse = ServiceResponse.failure(
        "invalid token",
        null,
        StatusCodes.FORBIDDEN,
    );
    return handleServiceResponse(serviceResponse, res);
}
