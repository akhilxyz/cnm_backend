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
