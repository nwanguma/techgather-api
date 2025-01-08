import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const clientApiKey = req.headers['x-client-api-key'] as string;
    const validApiKey = this.configService.get<string>('CLIENT_API_KEY');

    if (!clientApiKey || clientApiKey !== validApiKey) {
      throw new ForbiddenException();
    }

    next();
  }
}
