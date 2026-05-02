import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SqsModule } from '../sqs/sqs.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [PrismaModule, SqsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
