import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL is required in .env',
  }),
  JWT_SECRET: Joi.string().default('flightpath-development-super-secret-key-2026'),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().default('flightpath-development-refresh-secret-2026'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  SUPERADMIN_EMAIL: Joi.string().email().default('vinay@flightpath-training.com'),
  SUPERADMIN_PASSWORD: Joi.string().min(4).default('123456'),
});
