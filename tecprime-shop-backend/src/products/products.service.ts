import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  ListProductsDto,
  ListProductsFromExternalApiDto,
  PaginateProductsDto,
  PaginatedProductsDto,
} from './dtos/list-products.dto';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly httpService: HttpService) {}

  private cachedProducts: ListProductsDto[] | null = null;
  private cacheExpiresAt = 0;

  async getAllProducts(): Promise<ListProductsDto[]> {
    const now = Date.now();
    if (this.cachedProducts && now < this.cacheExpiresAt) {
      this.logger.debug('Cache hit: retornando produtos do cache');
      return this.cachedProducts;
    }

    this.logger.log('Cache miss: buscando produtos da API externa');

    const { data } = await firstValueFrom(
      this.httpService.get<ListProductsFromExternalApiDto[]>(
        process.env.EXTERNAL_PRODUCTS_API_URL!,
      ),
    );

    this.cachedProducts = data.map((product) => ({
      id: product.id,
      name: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      stock: Math.floor(Math.random() * 100) + 1,
    }));
    this.cacheExpiresAt = now + CACHE_TTL_MS;

    this.logger.log(`Cache atualizado: ${this.cachedProducts.length} produtos carregados`);

    return this.cachedProducts;
  }

  async getProducts(paginateDto: PaginateProductsDto): Promise<PaginatedProductsDto> {
    this.logger.debug(
      `Buscando produtos: page=${paginateDto.page} limit=${paginateDto.limit} search="${paginateDto.search ?? ''}"`,
    );

    const products = await this.getAllProducts();

    const filtered = paginateDto.search
      ? products.filter((p) =>
          p.name.toLowerCase().includes(paginateDto.search!.toLowerCase()),
        )
      : products;

    const total = filtered.length;
    const totalPages = Math.ceil(total / paginateDto.limit);
    const start = (paginateDto.page - 1) * paginateDto.limit;
    const paginatedData = filtered.slice(start, start + paginateDto.limit);

    this.logger.debug(`Retornando ${paginatedData.length} produtos de ${total} encontrados`);

    return {
      data: paginatedData,
      total,
      page: paginateDto.page,
      limit: paginateDto.limit,
      totalPages,
    };
  }
}
