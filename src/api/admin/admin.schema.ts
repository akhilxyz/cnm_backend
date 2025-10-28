import Joi from 'joi';

export const LoginAdminSchema = {
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};




export const CreateUserByAdminSchema = {
  body: Joi.object({
    fullName: Joi.string().required(),
    role: Joi.string().valid("ADMIN", "USER").required(),
    loginWith: Joi.string().valid("phone", "email", "gmail").required(),
    phoneNumber: Joi.string().when("loginWith", {
      is: "phone",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    email: Joi.string().email().when("loginWith", {
      is: Joi.valid("email", "gmail"),
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    password: Joi.string().min(6).required(),
    status: Joi.string().valid("active", "inactive", "suspended").default("active"),
  }),
};