import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SqsModule } from './sqs/sqs.module';
import { ProductsModule } from './products/products.module';

function validateConfig(config: Record<string, unknown>): Record<string, unknown> {
  const required = ['DATABASE_URL', 'SQS_REGION', 'SQS_QUEUE_URL'];
  const missing = required.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateConfig }),
    PrismaModule,
    SqsModule,
    ProductsModule,
  ],
})
export class AppModule {}
