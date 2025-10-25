import Joi from "joi";

export const CreateNotificationSchema = {
  body: Joi.object({
    whatsappAccountId: Joi.number().optional().allow(null), // optional, can be null
    contactId: Joi.number().required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
  }),
};