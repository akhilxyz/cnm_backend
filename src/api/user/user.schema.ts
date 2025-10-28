import Joi from 'joi';

export const UserSchema = Joi.object({
  id: Joi.number().required(),
  fullName: Joi.string().required(),
  aboutMe: Joi.string().optional(),
  phoneNumber: Joi.string().required(),
  isPhoneVerified: Joi.boolean().default(false),
  email: Joi.string().email().required(),
  isEmailVerified: Joi.boolean().default(false),
  linkedAccounts: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
  password: Joi.string().min(6).required(),
  image: Joi.string().uri().optional(),
  role: Joi.string().optional(),
  lang: Joi.string().default('en'),
  isActive: Joi.boolean().default(true),
  loginWith: Joi.string().valid('email', 'phone', 'gmail').required(),
});


export const CreateUserSchema = {
  body: Joi.object({
    fullName: Joi.string().required(),
    aboutMe: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    isPhoneVerified: Joi.boolean().default(false),
    email: Joi.string().email().required(),
    isEmailVerified: Joi.boolean().default(false),
    linkedAccounts: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
    password: Joi.string().min(6).required(),
    image: Joi.string().uri().optional(),
    lang: Joi.string().default('en'),
    isActive: Joi.boolean().default(true),
    loginWith: Joi.string().valid('email', 'phone', 'gmail').required(),
  }),
};


export const registerRequestSchema = {
  body: Joi.object({
    fullName: Joi.string().required(),
    loginWith: Joi.string()
      .valid('phone', 'email', 'gmail')
      .required(),
    
    phoneNumber: Joi.when('loginWith', {
      is: 'phone',
      then: Joi.string()
        .pattern(/^\+[1-9]\d{1,14}$/)
        .required()
        .messages({
          'string.pattern.base': 'Phone number must be in E.164 format, e.g., +1234567890',
        }),
      otherwise: Joi.forbidden(),
    }),

    email: Joi.when('loginWith', {
      is: 'email',
      then: Joi.string().email().required(),
      otherwise: Joi.forbidden(),
    }),

    password: Joi.when('loginWith', {
      is: 'email',
      then: Joi.string().min(6).required().messages({
        'any.required': 'Password is required when registering with email',
        'string.min': 'Password must be at least 6 characters',
      }),
      otherwise: Joi.forbidden(),
    }),

    otp: Joi.string()
      .length(4)
      .pattern(/^\d{4}$/)
      .required()
      .messages({
        'string.length': 'OTP must be exactly 4 digits',
        'string.pattern.base': 'OTP must only contain numbers',
        'any.required': 'OTP is required',
      }),
  }),
};



export const LoginRequestSchema = {
  body:
    Joi.object({
      loginWith: Joi.string()
        .valid('phone', 'email', 'gmail')
        .required(),
      phoneNumber: Joi.when('loginWith', {
        is: 'phone',
        then: Joi.string()
          .pattern(/^\+[1-9]\d{1,14}$/)
          .required()
          .messages({
            'string.pattern.base': 'Phone number must be in E.164 format, e.g., +1234567890',
          }),
        otherwise: Joi.forbidden(),
      }),
      email: Joi.when('loginWith', {
        is: 'email',
        then: Joi.string().email().required(),
        otherwise: Joi.forbidden(),
      })
    })
}

export const OTPRequestSchema = {
  body:
    Joi.object({
      loginWith: Joi.string()
        .valid('phone', 'email', 'gmail')
        .required(),
      phoneNumber: Joi.when('loginWith', {
        is: 'phone',
        then: Joi.string()
          .pattern(/^\+[1-9]\d{1,14}$/)
          .required()
          .messages({
            'string.pattern.base': 'Phone number must be in E.164 format, e.g., +1234567890',
          }),
        otherwise: Joi.forbidden(),
      }),

      email: Joi.when('loginWith', {
        is: 'email',
        then: Joi.string().email().required(),
        otherwise: Joi.forbidden(),
      }),
      otp: Joi.string()
        .length(4)
        .pattern(/^\d{4}$/)
        .required()
        .messages({
          'string.length': 'OTP must be exactly 4 digits',
          'string.pattern.base': 'OTP must only contain numbers',
          'any.required': 'OTP is required',
        }),
    }),
}


export const LoginSchema = {
  body: Joi.object({
    loginWith: Joi.string()
      .valid('phone', 'email', 'gmail')
      .required()
      .messages({
        'any.only': 'loginWith must be either phone, email, or gmail',
        'any.required': 'loginWith is required',
      }),

    phoneNumber: Joi.when('loginWith', {
      is: 'phone',
      then: Joi.string()
        .pattern(/^\+[1-9]\d{1,14}$/)
        .required()
        .messages({
          'string.pattern.base': 'Phone number must be in E.164 format, e.g., +1234567890',
          'any.required': 'Phone number is required when loginWith is phone',
        }),
      otherwise: Joi.forbidden(),
    }),

    email: Joi.when('loginWith', {
      is: 'email',
      then: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Email must be a valid email address',
          'any.required': 'Email is required when loginWith is email',
        }),
      otherwise: Joi.forbidden(),
    }),

    password: Joi.when('loginWith', {
      is: 'email',
      then: Joi.string()
        .required()
        .messages({
          'any.required': 'Password is required when loginWith is email',
        }),
      otherwise: Joi.forbidden(),
    }),

    otp: Joi.when('loginWith', {
      is: 'phone',
      then: Joi.string()
        .length(4)
        .pattern(/^\d{4}$/)
        .required()
        .messages({
          'string.length': 'OTP must be exactly 4 digits',
          'string.pattern.base': 'OTP must only contain numbers',
          'any.required': 'OTP is required when loginWith is phone',
        }),
      otherwise: Joi.forbidden(),
    }),

    token: Joi.when('loginWith', {
      is: 'gmail',
      then: Joi.string()
        .required()
        .messages({
          'any.required': 'Token is required when loginWith is gmail',
        }),
      otherwise: Joi.forbidden(),
    }),
  }),
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string()
    .length(4)
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 4 digits',
      'string.pattern.base': 'OTP must only contain numbers',
      'any.required': 'OTP is required',
    }),
  }),
};

export const forgotPasswordLinkSchema = {
  body: Joi.object({
    email: Joi.string().email().required()
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    password: Joi.string().min(6).required(),
    token: Joi.string().required()
  }),
};
