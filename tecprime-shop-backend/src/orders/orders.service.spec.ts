import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './repositories/orders.repository';
import { ProductsService } from '../products/products.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, PaymentMethod } from './dtos/create-order.dto';
import { ListProductsDto } from '../products/dtos/list-products.dto';

const mockDate = new Date('2024-01-01T00:00:00.000Z');

const mockItem: OrderItem = {
  id: 1,
  orderId: 1,
  order: {} as Order,
  productIdExternal: 10,
  productName: 'Notebook Gamer',
  productDescription: 'Ótimo para jogos',
  productImage: 'https://img.example.com/1.jpg',
  productUnitPrice: 4999.99,
  quantity: 1,
  totalPrice: 4999.99,
  createdAt: mockDate,
  updatedAt: mockDate,
};

const mockOrder: Order = {
  id: 1,
  userId: 1,
  user: {} as any,
  status: 'pending',
  totalAmount: 4999.99,
  paymentMethod: 'Pix',
  shippingStreet: 'Rua das Flores',
  shippingNumber: '123',
  shippingComplement: 'Apto 4',
  shippingNeighborhood: 'Centro',
  shippingCity: 'São Paulo',
  shippingState: 'SP',
  shippingZipCode: '01001-000',
  shippingCountry: 'Brasil',
  items: [mockItem],
  createdAt: mockDate,
  updatedAt: mockDate,
};

const mockProduct: ListProductsDto = {
  id: 10,
  name: 'Notebook Gamer',
  description: 'Ótimo para jogos',
  price: 4999.99,
  stock: 5,
  image: 'https://img.example.com/1.jpg',
};

const mockCreateOrderDto: CreateOrderDto = {
  paymentMethod: PaymentMethod.PIX,
  shippingAddress: {
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 4',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01001-000',
    country: 'Brasil',
  },
  items: [
    {
      productId: 10,
      productName: 'Notebook Gamer',
      productDescription: 'Ótimo para jogos',
      productImage: 'https://img.example.com/1.jpg',
      productUnitPrice: 4999.99,
      quantity: 1,
    },
  ],
};

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: jest.Mocked<OrdersRepository>;
  let productsService: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: {
            createWithItems: jest.fn(),
            findByIdAndUser: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            getAllProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepository = module.get(OrdersRepository);
    productsService = module.get(ProductsService);
  });

  describe('createOrder', () => {
    it('deve criar e retornar um pedido com os dados corretos', async () => {
      productsService.getAllProducts.mockResolvedValue([mockProduct]);
      ordersRepository.createWithItems.mockResolvedValue(mockOrder);

      const result = await service.createOrder(1, mockCreateOrderDto);

      expect(result.orderId).toBe(mockOrder.id);
      expect(result.status).toBe('pending');
      expect(result.totalAmount).toBe(4999.99);
      expect(result.paymentMethod).toBe('Pix');
      expect(ordersRepository.createWithItems).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          paymentMethod: PaymentMethod.PIX,
          totalAmount: 4999.99,
        }),
      );
    });

    it('deve lançar NotFoundException quando produto do pedido não existe no catálogo', async () => {
      productsService.getAllProducts.mockResolvedValue([]); // catálogo vazio

      await expect(service.createOrder(1, mockCreateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException quando quantidade excede o estoque', async () => {
      const productComEstoqueBaixo: ListProductsDto = {
        ...mockProduct,
        stock: 0,
      };
      productsService.getAllProducts.mockResolvedValue([
        productComEstoqueBaixo,
      ]);

      await expect(service.createOrder(1, mockCreateOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve calcular o totalAmount corretamente para múltiplos itens', async () => {
      const secondProduct: ListProductsDto = {
        id: 20,
        name: 'Mouse Sem Fio',
        description: 'Confortável',
        price: 149.9,
        stock: 10,
        image: 'https://img.example.com/2.jpg',
      };

      const dtoComDoisItens: CreateOrderDto = {
        ...mockCreateOrderDto,
        items: [
          ...mockCreateOrderDto.items,
          {
            productId: 20,
            productName: 'Mouse Sem Fio',
            productDescription: 'Confortável',
            productImage: 'https://img.example.com/2.jpg',
            productUnitPrice: 149.9,
            quantity: 2,
          },
        ],
      };

      const expectedTotal = 4999.99 + 149.9 * 2; // 5299.79

      productsService.getAllProducts.mockResolvedValue([
        mockProduct,
        secondProduct,
      ]);
      ordersRepository.createWithItems.mockResolvedValue({
        ...mockOrder,
        totalAmount: expectedTotal,
      });

      await service.createOrder(1, dtoComDoisItens);

      expect(ordersRepository.createWithItems).toHaveBeenCalledWith(
        expect.objectContaining({ totalAmount: expectedTotal }),
      );
    });
  });

  describe('findOrderById', () => {
    it('deve retornar os detalhes do pedido quando encontrado', async () => {
      ordersRepository.findByIdAndUser.mockResolvedValue(mockOrder);

      const result = await service.findOrderById(1, 1);

      expect(result.orderId).toBe(mockOrder.id);
      expect(result.shippingCity).toBe('São Paulo');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productName).toBe('Notebook Gamer');
    });

    it('deve lançar NotFoundException quando o pedido não é encontrado', async () => {
      ordersRepository.findByIdAndUser.mockResolvedValue(null);

      await expect(service.findOrderById(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
