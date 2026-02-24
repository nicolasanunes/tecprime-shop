import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PaginateProductsDto, PaginatedProductsDto } from './dtos/list-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query() paginateDto: PaginateProductsDto): Promise<PaginatedProductsDto> {
    return this.productsService.getProducts(paginateDto);
  }
}
  