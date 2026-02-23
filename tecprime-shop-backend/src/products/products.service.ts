import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  ListProductsDto,
  ListProductsFromExternalApiDto,
  PaginateProductsDto,
  PaginatedProductsDto,
} from './dtos/list-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly httpService: HttpService) {}

  async getProducts(paginateDto: PaginateProductsDto): Promise<PaginatedProductsDto> {
    const { data } = await firstValueFrom(
      this.httpService.get<ListProductsFromExternalApiDto[]>(
        process.env.EXTERNAL_PRODUCTS_API_URL!,
      ),
    );

    const products: ListProductsDto[] = data.map((product) => ({
      id: product.id,
      name: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      stock: Math.floor(Math.random() * 100) + 1,
    }));

    const total = products.length;
    const totalPages = Math.ceil(total / paginateDto.limit);
    const start = (paginateDto.page - 1) * paginateDto.limit;
    const paginatedData = products.slice(start, start + paginateDto.limit);

    return {
      data: paginatedData,
      total,
      page: paginateDto.page,
      limit: paginateDto.limit,
      totalPages,
    };
  }
}
