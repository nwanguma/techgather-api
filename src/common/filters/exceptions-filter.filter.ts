import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error', details: '' };

    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as any).message;

    const details =
      typeof errorResponse === 'string'
        ? ''
        : (errorResponse as any).details || '';

    response.status(status).json({
      status: 'failed',
      message: message || 'An unexpected error occurred',
      error: {
        type:
          exception instanceof HttpException
            ? exception.name
            : 'InternalServerError',
        details: details,
      },
      code:
        exception instanceof HttpException
          ? (errorResponse as any).code || null
          : null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
