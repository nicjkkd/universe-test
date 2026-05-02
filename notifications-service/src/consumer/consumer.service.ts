import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsumerService.name);
  private readonly client: SQSClient;
  private readonly queueUrl: string;
  private running = false;

  constructor(config: ConfigService) {
    this.client = new SQSClient({
      endpoint: config.get<string>('SQS_ENDPOINT'),
      region: config.get<string>('SQS_REGION'),
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.queueUrl = config.get<string>('SQS_QUEUE_URL')!;
  }

  onModuleInit(): void {
    this.running = true;
    void this.poll();
    this.logger.log(`Listening on: ${this.queueUrl}`);
  }

  onModuleDestroy(): void {
    this.running = false;
  }

  private async poll(): Promise<void> {
    while (this.running) {
      try {
        const result = await this.client.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
          }),
        );

        for (const message of result.Messages ?? []) {
          try {
            const body = JSON.parse(message.Body ?? '{}') as {
              type: string;
              payload: unknown;
              occurredAt: string;
            };
            this.logger.log(
              `[${body.type}] ${JSON.stringify(body.payload)} — ${body.occurredAt}`,
            );
            await this.client.send(
              new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: message.ReceiptHandle!,
              }),
            );
          } catch {
            this.logger.error('Failed to process message', message.Body);
          }
        }
      } catch (err) {
        this.logger.error('SQS poll error', err);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }
}
