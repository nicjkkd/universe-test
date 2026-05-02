import { IsString, IsPositive, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @Type(() => Number)
  @IsPositive()
  price!: number;
}
