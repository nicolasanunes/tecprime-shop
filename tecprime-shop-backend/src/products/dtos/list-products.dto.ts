import { IsInt, IsOptional, Min } from '@nestjs/class-validator';
import { Type } from 'class-transformer';

export class ListProductsFromExternalApiDto {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

export class ListProductsDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

export class PaginateProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}

export class PaginatedProductsDto {
  data: ListProductsDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
