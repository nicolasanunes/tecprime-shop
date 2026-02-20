import { HttpService } from '@nestjs/axios/dist/http.service';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  ListProductsDto,
  ListProductsFromExternalApiDto,
} from './dtos/list-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly httpService: HttpService) {}

  async getProducts(): Promise<ListProductsDto[]> {
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

    return products;
  }
}
