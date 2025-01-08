import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('database', () => {
  const databaseConfigValidationSchema = Joi.object({
    DATABASE_URL: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
  }).unknown(true);

  const validatedDatabaseConfig = databaseConfigValidationSchema.validate(
    process.env,
    { abortEarly: false },
  );

  if (validatedDatabaseConfig.error) {
    throw new InternalServerErrorException(
      `Database configuration validation error: ${validatedDatabaseConfig.error.message}`,
    );
  }

  return {
    url: validatedDatabaseConfig.value.DATABASE_URL,
    name: validatedDatabaseConfig.value.DATABASE_NAME,
  };
});
