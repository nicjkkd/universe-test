import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(private readonly config: ConfigService) {
    this.client = new SQSClient({
      endpoint: config.get<string>('SQS_ENDPOINT'),
      region: config.get<string>('SQS_REGION'),
      credentials: {
        accessKeyId: config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.queueUrl = config.getOrThrow<string>('SQS_QUEUE_URL');
  }

  async publish(type: string, payload: unknown): Promise<void> {
    try {
      await this.client.send(
        new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify({
            type,
            payload,
            occurredAt: new Date().toISOString(),
          }),
        }),
      );
    } catch (err) {
      this.logger.error(`Failed to publish ${type}`, err);
      throw err;
    }
  }
}
