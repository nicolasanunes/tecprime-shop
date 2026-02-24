import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dtos/create-order.dto';
import { ListOrderDto } from './dtos/list-order.dto';
import { ListOrderDetailDto } from './dtos/list-order-detail.dto';
import { OrdersRepository } from './repositories/orders.repository';
import { OrderMapper } from './mappers/order.mapper';
import { OrderValidator } from './validators/order.validator';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsService: ProductsService,
  ) {}

  async createOrder(userId: number, dto: CreateOrderDto): Promise<ListOrderDto> {
    this.logger.log(`Iniciando criação de pedido: userId=${userId} itens=${dto.items.length}`);

    const allProducts = await this.productsService.getAllProducts();
    OrderValidator.validateStock(dto.items, allProducts);

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.productUnitPrice * item.quantity,
      0,
    );

    const savedOrder = await this.ordersRepository.createWithItems({
      userId,
      paymentMethod: dto.paymentMethod,
      totalAmount,
      shippingStreet: dto.shippingAddress.street,
      shippingNumber: dto.shippingAddress.number,
      shippingComplement: dto.shippingAddress.complement,
      shippingNeighborhood: dto.shippingAddress.neighborhood,
      shippingCity: dto.shippingAddress.city,
      shippingState: dto.shippingAddress.state,
      shippingZipCode: dto.shippingAddress.zipCode,
      shippingCountry: dto.shippingAddress.country,
      items: dto.items.map((item) => ({
        productIdExternal: item.productId,
        productName: item.productName,
        productDescription: item.productDescription,
        productImage: item.productImage,
        productUnitPrice: item.productUnitPrice,
        quantity: item.quantity,
        totalPrice: item.productUnitPrice * item.quantity,
      })),
    });

    this.logger.log(
      `Pedido criado com sucesso: orderId=${savedOrder.id} userId=${userId} total=${totalAmount.toFixed(2)} itens=${dto.items.length}`,
    );

    return OrderMapper.toListDto(savedOrder);
  }

  async findOrderById(userId: number, orderId: number): Promise<ListOrderDetailDto> {
    this.logger.debug(`Buscando pedido: orderId=${orderId} userId=${userId}`);

    const order = await this.ordersRepository.findByIdAndUser(orderId, userId);

    if (!order) {
      this.logger.warn(`Pedido não encontrado: orderId=${orderId} userId=${userId}`);
      throw new NotFoundException(`Pedido #${orderId} não encontrado.`);
    }

    return OrderMapper.toDetailDto(order);
  }
}
