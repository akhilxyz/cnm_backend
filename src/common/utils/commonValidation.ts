import { UserValidationResult } from "@/interface/user.interface";
import { z } from "zod";
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library';
import jwt, { SignOptions } from 'jsonwebtoken';

export const commonValidations = {
  id: z
    .string()
    .refine((data) => !Number.isNaN(Number(data)), "ID must be a numeric value")
    .transform(Number)
    .refine((num) => num > 0, "ID must be a positive number"),
  // ... other common validations
};


export function validateRequestType(type: string, userExists: boolean): UserValidationResult {
  switch (type.toUpperCase()) {
    case 'EMAIL':
    case 'PHONE':
      if (userExists) {
        return {
          status: 'EXISTING_USER',
          action: 'REQUEST_PASSWORD',
          message: `${type} exists. Requesting password.`,
        };
      } else {
        return {
          status: 'NEW_USER',
          action: 'SEND_OTP',
          message: `${type} does not exist. Sending OTP.`,
        };
      }

    case 'GMAIL':
      if (userExists) {
        return {
          status: 'EXISTING_USER',
          action: 'REQUEST_PASSWORD',
          message: `Token login: user exists, requesting password.`,
        };
      } else {
        return {
          status: 'NEW_USER',
          action: 'USE_TOKEN',
          message: `Token login: user not found, using token.`,
        };
      }

    default:
      return {
        status: 'INVALID_TYPE',
        action: 'ERROR',
        message: 'Invalid login type. Use email, phone, or gmail.',
      };
  }
}

export async function compareHash(inputHash : string , storedHash : string) {
   return await bcrypt.compare(inputHash, storedHash);
}

export async function encryptData(payload:string) {
  return await bcrypt.hash(payload, 10);
}

export async function requestOTPPayload(data: any) {
  const otp = '1234' //Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  const payload: any = {
    otpHash,
    expiresAt,
  };
  if (data?.email) payload.email = data.email;
  if (data?.phoneNumber) payload.phoneNumber = data?.phoneNumber;
  return { payload, dataObj: data };
}

export async function validateOTP(inputOtp: string, storedOtpHash: string, expiresAt: Date) {
  // First, check if OTP is expired
  if (new Date() > expiresAt) {
    return { isValid: false, message: "OTP has expired" };
  }

  // Then, compare input OTP with stored hash
  const isMatch = await bcrypt.compare(inputOtp, storedOtpHash);

  if (!isMatch) {
    return { isValid: false, message: "Invalid OTP" };
  }

  return { isValid: true, message: "OTP is valid" };
}


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(token: string) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID, // Your client ID
  });

  const payload = ticket.getPayload();
  return payload; // contains user info like email, name, picture, etc.
}


export const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret'; // Use env variable in production!
export const JWT_EXPIRES_IN :any =  process.env.JWT_EXPIRES_IN || '7d'; // You can change it (e.g., '1h', '30m', etc.)



export const createJwtToken = (payload: object): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
};

export const verifyJwtToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret);
  } catch (error) {
    return null;
  }
};