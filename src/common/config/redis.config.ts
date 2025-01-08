import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('redis', () => {
  const redisConfigValidationSchema = Joi.object({
    REDIS_URL: Joi.string().required(),
    REDIS_TOKEN:
      process.env.NODE_ENV === 'development'
        ? Joi.any()
        : Joi.string().required(),
  }).unknown(true);

  const validatedRedisConfig = redisConfigValidationSchema.validate(
    process.env,
    { abortEarly: false },
  );

  if (validatedRedisConfig.error) {
    throw new InternalServerErrorException(
      `Redis configuration validation error: ${validatedRedisConfig.error.message}`,
    );
  }

  return {
    url: validatedRedisConfig.value.REDIS_URL,
    token: validatedRedisConfig.value.REDIS_TOKEN,
  };
});
