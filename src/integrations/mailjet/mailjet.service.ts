import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Mailjet from 'node-mailjet';

@Injectable()
export class MailjetService {
  private readonly mailjet: Mailjet;
  private readonly logger = new Logger(MailjetService.name);

  constructor(private configService: ConfigService) {
    this.mailjet = Mailjet.Client.apiConnect(
      this.configService.get<string>('MAILJET_API_KEY'),
      this.configService.get<string>('MAILJET_API_SECRET'),
    );
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<any> {
    try {
      const request = this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'placeholder@example.com',
              Name: 'Placeholder',
            },
            To: [
              {
                Email: to,
              },
            ],
            Subject: subject,
            TextPart: textContent || '',
            HTMLPart: htmlContent,
          },
        ],
      });

      const result = await request;
      this.logger.log(`Email sent to ${to}`);
      return result.body;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw new InternalServerErrorException('Email sending failed');
    }
  }
}
