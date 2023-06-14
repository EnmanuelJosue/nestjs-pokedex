import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
    MONGODB: Joi.required(),
    PORT: Joi.string().default('3001'),
    DEFAULT_LIMIT: Joi.string().default('6')
})
