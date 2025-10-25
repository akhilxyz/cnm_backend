export interface User {
    id: number;
    fullName: string;
    aboutMe?: string;
    phoneNumber?: string;
    isPhoneVerified?: boolean;
    email?: string;
    isEmailVerified?: boolean;
    rating?: number;
    linkedAccounts?: Record<string, any>;
    password?: string;
    otp?: string;
    image?: string;
    lang?: string;
    isActive?: boolean;
    loginWith: 'email' | 'phone' | 'gmail';
}

export interface RegisterRequest {
    fullName: string;
    loginWith: 'phone' | 'email' | 'gmail';
    phoneNumber?: string;
    email?: string;
    password?: string;
    otp: string;
}


export interface CreateUserInput
    extends Omit<User, 'id'> { } // reuse User but omit `id` for create

export interface loginRequest {
    loginWith: 'phone' | 'email' | 'gmail';
    phoneNumber: string;
    email: string;
}

export interface otpRequest {
    loginWith: 'phone' | 'email' | 'gmail';
    phoneNumber: string;
    email: string,
    otp: string
}

export interface forgotPasswordRequest {
    loginWith: 'phone' | 'email' | 'gmail';
    email: string;
    otp: string;
    password: string;
}

export interface changePasswordRequest {
    token: string,
    password: string,
}

export interface login {
    loginWith: 'phone' | 'email' | 'gmail';
    phoneNumber?: string;
    email?: string;
    otp?: string;
    token?: string;
    password?: string;
}

export interface loginWithEmail {
    email: string;
    password: string;
}

export interface CheckUserParams {
    id?: number
    type?: string;
    email?: string;
    phoneNumber?: string;
    token?: string;
}

export interface UpdateUserParams {
    type?: string;
    email?: string;
    phoneNumber?: string;
    token?: string;
    password?: string
}

export interface UserValidationResult {
    status: 'EXISTING_USER' | 'NEW_USER' | 'INVALID_TYPE';
    action: 'REQUEST_PASSWORD' | 'SEND_OTP' | 'USE_TOKEN' | 'ERROR';
    message: string;
}

export interface OTP {
    id: number;
    email?: string;
    phoneNumber?: string;
    otpHash: string;
    expiresAt: Date;
}

export interface CreateOTPInput extends Omit<OTP, 'id' | 'createdAt' | 'updatedAt'> { }