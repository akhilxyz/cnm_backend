// types.d.ts
import 'express';

// Define your JWT payload interface
export interface UserJwtPayload {
    id: string;
    username?: string;
    email?: string;
    role: string;
    iat?: number;
    exp?: number;
}

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            user?: UserJwtPayload;
        }
    }
}