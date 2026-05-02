import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SqsService } from '../sqs/sqs.service';
import { CreateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sqs: SqsService,
  ) {}

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({ data: dto });
    await this.sqs.publish('product.created', product);
    return product;
  }

  async remove(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Product ${id} not found`);
    await this.prisma.product.delete({ where: { id } });
    await this.sqs.publish('product.deleted', { id });
  }

  async list(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
