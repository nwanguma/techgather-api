import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(
    file: Express.MulterFile,
    folderPath: string,
  ): Promise<string> {
    const bucketName = this.configService.get<string>('S3_BUCKET_NAME');
    const regionName = this.configService.get<string>('AWS_REGION');
    const key = `${folderPath}/${uuidv4()}-${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return `https://${bucketName}.s3.${regionName}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Could not upload file. Please try again later.');
    }
  }
}
