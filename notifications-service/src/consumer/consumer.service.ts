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
  Message,
} from '@aws-sdk/client-sqs';

const MAX_RECEIVE_COUNT = 5;
const MAX_BACKOFF_MS = 30_000;

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsumerService.name);
  private readonly client: SQSClient;
  private readonly queueUrl: string;
  private running = false;
  private pollDone: Promise<void> = Promise.resolve();

  constructor(config: ConfigService) {
    const accessKeyId = config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('AWS_SECRET_ACCESS_KEY');

    this.client = new SQSClient({
      endpoint: config.get<string>('SQS_ENDPOINT'),
      region: config.getOrThrow<string>('SQS_REGION'),
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });
    this.queueUrl = config.getOrThrow<string>('SQS_QUEUE_URL');
  }

  onModuleInit(): void {
    this.running = true;
    this.pollDone = this.poll();
    this.logger.log(`Listening on: ${this.queueUrl}`);
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false;
    await this.pollDone;
  }

  private async poll(): Promise<void> {
    let attempt = 0;
    while (this.running) {
      try {
        const result = await this.client.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
            VisibilityTimeout: 60,
            MessageSystemAttributeNames: ['ApproximateReceiveCount'],
          }),
        );

        attempt = 0;
        for (const message of result.Messages ?? []) {
          await this.processMessage(message);
        }
      } catch (err) {
        this.logger.error('SQS poll error', err);
        attempt++;
        const base = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
        const delay = base + Math.random() * base * 0.5;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  private async processMessage(message: Message): Promise<void> {
    if (!message.Body) {
      this.logger.warn('Received message with no body; skipping');
      return;
    }
    if (!message.ReceiptHandle) {
      this.logger.warn('Received message with no ReceiptHandle; skipping');
      return;
    }

    const receiveCount = parseInt(
      message.Attributes?.ApproximateReceiveCount ?? '1',
      10,
    );
    if (receiveCount > MAX_RECEIVE_COUNT) {
      this.logger.warn(
        `Discarding poison message after ${receiveCount} attempts: ${message.Body}`,
      );
      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );
      return;
    }

    try {
      const body = JSON.parse(message.Body) as {
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
          ReceiptHandle: message.ReceiptHandle,
        }),
      );
    } catch {
      this.logger.error('Failed to process message', message.Body);
    }
  }
}
