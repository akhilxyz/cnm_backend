import Joi from "joi";


export const createAccountSchema = {
  body: Joi.object({
    phone_number: Joi.string().required(), // E.164 format
    display_name: Joi.string().min(2).max(50).required(),
    business_name: Joi.string().min(2).max(100).required(),
    phone_number_id: Joi.string().required(),
    business_account_id: Joi.string().required(),
    token: Joi.string().required(),
    api_key: Joi.string().required(),
  }),
};

export const createContactSchema = {
  body: Joi.object({
    phone_number: Joi.string()
      .required()
      .messages({
        "string.pattern.base": "Phone number must be in E.164 format (e.g., +14155552671).",
      }),
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        "string.min": "Name must be at least 2 characters long.",
        "string.max": "Name must not exceed 100 characters.",
      }),
    country_code: Joi.string()
      .min(2)
      .max(4)
      .required()
      .messages({
        "string.min": "Name must be at least 2 characters long.",
        "string.max": "Name must not exceed 4 characters.",
      }),
  }),
};



export const whatsappWebhookSchema = {
  body: Joi.object({
    whatsappAccountId: Joi.number().required(),
    contactId: Joi.number().required(),
    messageId: Joi.string().required(),
    direction: Joi.string().valid("inbound", "outbound").required(),
    messageType: Joi.string()
      .valid("text", "image", "video", "audio", "document", "location", "contacts")
      .required(),
    content: Joi.string().allow(null, ""),
    mediaUrl: Joi.string().uri().allow(null, ""),
    mediaId: Joi.string().allow(null, ""),
    mimeType: Joi.string().allow(null, ""),
    caption: Joi.string().allow(null, ""),
    fileName: Joi.string().allow(null, ""),
    fileSize: Joi.number().allow(null),
    status: Joi.string().default("received"),
    metadata: Joi.object().allow(null),
    timestamp: Joi.date().required(),
  }),
};

export const sendMessageSchema = {
  body: Joi.object({
    contactId: Joi.number().required().messages({
      "number.base": "Contact ID must be a number.",
      "any.required": "Contact ID is required.",
    }),
    messageType: Joi.string()
      .valid("text", "image", "video", "audio", "document", "template")
      .default("text"),
    content: Joi.any().allow(null, "").messages({
      "string.empty": "Message content cannot be empty.",
    }),
    mediaUrl: Joi.string().uri().allow(null, ""),
    mediaId: Joi.string().allow(null, ""),
    mimeType: Joi.string().allow(null, ""),
    caption: Joi.string().allow(null, ""),
    fileName: Joi.string().allow(null, ""),
    fileSize: Joi.number().allow(null, ""),
  }),
};



export const sendTemplateMessageSchema = {
  body: Joi.object({
    contactId: Joi.number().required().messages({
      "number.base": "Contact ID must be a number.",
      "any.required": "Contact ID is required.",
    }),
    templateMeta: Joi.any(),
    messageType: Joi.string()
      .valid("text", "image", "video", "audio", "document", "template")
      .default("text"),
    templateName: Joi.string().required().messages({
      "string.base": "Template name must be a string.",
      "any.required": "Template name is required for template messages.",
    }),

    languageCode: Joi.string()
      .default("en_US")
      .messages({
        "string.base": "languageCode name must be a string."
      }),

    components: Joi.array()
      .items(
        Joi.object({
          type: Joi.string()
            .valid("HEADER", "BODY", "FOOTER", "BUTTONS")
            .required()
            .messages({
              "any.only":
                "Component type must be one of HEADER, BODY, FOOTER, or BUTTONS.",
              "any.required": "Component type is required.",
            }),
          format: Joi.string()
            .valid("TEXT", "IMAGE", "VIDEO", "DOCUMENT")
            .optional(),
          text: Joi.string().allow(null, ""),
          example: Joi.object().optional(),
          parameters: Joi.array().items(
            Joi.object({
              type: Joi.string().valid("text", "image", "video", "document"),
              text: Joi.string().allow(""),
              image: Joi.object({
                id: Joi.string().allow(""),
                link: Joi.string().uri().allow(""),
              }).optional(),
              video: Joi.object({
                id: Joi.string().allow(""),
                link: Joi.string().uri().allow(""),
              }).optional(),
              document: Joi.object({
                id: Joi.string().allow(""),
                link: Joi.string().uri().allow(""),
              }).optional(),
            })
          ),
        })
      )
      .required()
      .messages({
        "any.required": "Template components are required.",
        "array.base": "Components must be an array.",
      }),

    // Optional plain text or preview settings for your app-level usage
    content: Joi.string().allow(null, ""),
    previewUrl: Joi.boolean().default(false),
  }).options({ stripUnknown: true }),
};




export const createGroupSchema = {
  body: Joi.object({
    subject: Joi.string().min(1).max(100).required().messages({
      "string.empty": "Group name is required.",
      "string.max": "Group name cannot exceed 100 characters.",
    }),
    description: Joi.string().min(1).required().messages({
      "string.empty": "description name is required.",
    }),
    participants: Joi.array()
      .items(Joi.string().pattern(/^\+?[1-9]\d{1,14}$/))
      .min(1)
      .required()
      .messages({
        "array.min": "At least one participant is required.",
        "string.pattern.base": "Invalid phone number format.",
      }),
  }),
};

export const updateGroupSchema = {
  body: Joi.object({
    subject: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(512).allow(null, ""),
  }),
};

export const addMembersSchema = {
  body: Joi.object({
    participants: Joi.array()
      .items(Joi.string().pattern(/^\+?[1-9]\d{1,14}$/))
      .min(1)
      .required()
      .messages({
        "array.min": "At least one participant is required.",
      }),
  }),
};

export const updateAdminsSchema = {
  body: Joi.object({
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    action: Joi.string().valid("promote", "demote").required(),
  }),
};

export const updateGroupSettingsSchema = {
  body: Joi.object({
    announcementMode: Joi.boolean().optional(),
    restrictedAddition: Joi.boolean().optional(),
  }),
};

export const sendGroupMessageSchema = {
  body: Joi.object({
    messageType: Joi.string()
      .valid("text", "image", "video", "audio", "document")
      .default("text"),
    content: Joi.string().when("messageType", {
      is: "text",
      then: Joi.required(),
      otherwise: Joi.allow(null, ""),
    }),
    mediaUrl: Joi.string().uri().allow(null, ""),
    mediaId: Joi.string().allow(null, ""),
    caption: Joi.string().allow(null, ""),
    fileName: Joi.string().allow(null, ""),
  }),
};

export const createCampaignSchema = {
  body: Joi.object({
    title: Joi.string().min(1).max(255).required().messages({
      "string.empty": "Campaign title is required.",
      "string.max": "Title cannot exceed 255 characters.",
    }),
    templateName: Joi.string().required().messages({
      "string.empty": "Template name is required.",
    }),
    languageCode: Joi.string().default("en_US"),
    templateMeta: Joi.object().required().messages({
      "object.base": "Template metadata is required.",
    }),
    components: Joi.array().items(Joi.object()).required().messages({
      "array.base": "Components must be an array.",
    }),
    contactIds: Joi.array()
      .items(Joi.number())
      .min(1)
      .required()
      .messages({
        "array.min": "At least one contact is required.",
        "array.base": "Contact IDs must be an array.",
      }),
    scheduledAt: Joi.date().iso().allow(null, "").optional(),
  }),
};

export const updateCampaignSchema = {
  body: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    templateName: Joi.string().optional(),
    languageCode: Joi.string().optional(),
    templateMeta: Joi.object().optional(),
    components: Joi.array().items(Joi.object()).optional(),
    contactIds: Joi.array().items(Joi.number()).min(1).optional(),
    scheduledAt: Joi.date().iso().allow(null, "").optional(),
    status: Joi.string().valid('draft', 'scheduled', 'paused').optional(),
  }),
};

export const sendCampaignSchema = {
  params: Joi.object({
    id: Joi.number().required(),
  }),
};

export const scheduleCampaignSchema = {
  body: Joi.object({
    scheduledAt: Joi.date().iso().required().messages({
      "date.base": "Valid scheduled date is required.",
    }),
  }),
};