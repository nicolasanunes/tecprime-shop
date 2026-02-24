import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ProductsService } from './products.service';
import { ListProductsFromExternalApiDto } from './dtos/list-products.dto';

const mockExternalProducts: ListProductsFromExternalApiDto[] = [
  {
    id: 1,
    title: 'Notebook Gamer',
    description: 'Ótimo para jogos',
    price: 4999.99,
    image: 'https://img.example.com/1.jpg',
    category: 'electronics',
    rating: { rate: 4.5, count: 200 },
  },
  {
    id: 2,
    title: 'Mouse Sem Fio',
    description: 'Confortável e preciso',
    price: 149.9,
    image: 'https://img.example.com/2.jpg',
    category: 'electronics',
    rating: { rate: 4.2, count: 150 },
  },
  {
    id: 3,
    title: 'Teclado Mecânico',
    description: 'Switches Cherry MX',
    price: 299.9,
    image: 'https://img.example.com/3.jpg',
    category: 'electronics',
    rating: { rate: 4.8, count: 300 },
  },
];

function buildAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

describe('ProductsService', () => {
  let service: ProductsService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    httpService = module.get(HttpService);

    // Reseta o cache entre testes
    (service as any).cachedProducts = null;
    (service as any).cacheExpiresAt = 0;
  });

  describe('getAllProducts', () => {
    it('deve buscar da API externa e popular o cache no primeiro acesso (cache miss)', async () => {
      httpService.get.mockReturnValue(
        of(buildAxiosResponse(mockExternalProducts)),
      );

      const result = await service.getAllProducts();

      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Notebook Gamer');
      expect(result[0].price).toBe(4999.99);
    });

    it('deve retornar do cache sem chamar a API (cache hit)', async () => {
      httpService.get.mockReturnValue(
        of(buildAxiosResponse(mockExternalProducts)),
      );

      await service.getAllProducts(); // popula o cache
      httpService.get.mockClear();

      await service.getAllProducts(); // deve usar o cache

      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('deve chamar a API novamente quando o cache expirar', async () => {
      httpService.get.mockReturnValue(
        of(buildAxiosResponse(mockExternalProducts)),
      );

      await service.getAllProducts();
      (service as any).cacheExpiresAt = Date.now() - 1000; // expirar o cache

      await service.getAllProducts();

      expect(httpService.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getProducts', () => {
    beforeEach(() => {
      httpService.get.mockReturnValue(
        of(buildAxiosResponse(mockExternalProducts)),
      );
    });

    it('deve retornar todos os produtos paginados sem filtro', async () => {
      const result = await service.getProducts({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('deve aplicar paginação corretamente', async () => {
      const result = await service.getProducts({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(2);
    });

    it('deve retornar a segunda página de resultados', async () => {
      const result = await service.getProducts({ page: 2, limit: 2 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Teclado Mecânico');
    });

    it('deve filtrar produtos pelo nome (case-insensitive)', async () => {
      const result = await service.getProducts({
        page: 1,
        limit: 10,
        search: 'mouse',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Mouse Sem Fio');
      expect(result.total).toBe(1);
    });

    it('deve retornar lista vazia quando nenhum produto corresponde ao filtro', async () => {
      const result = await service.getProducts({
        page: 1,
        limit: 10,
        search: 'produto_inexistente',
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });
});
