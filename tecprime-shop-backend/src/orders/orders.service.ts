import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { ListOrderDto } from './dtos/list-order.dto';
import { ListOrderDetailDto } from './dtos/list-order-detail.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(userId: number, dto: CreateOrderDto): Promise<ListOrderDto> {
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.productUnitPrice * item.quantity,
      0,
    );

    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
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
      });

      const savedOrder = await manager.save(order);

      const orderItems = dto.items.map((item) =>
        manager.create(OrderItem, {
          orderId: savedOrder.id,
          productIdExternal: item.productId,
          productName: item.productName,
          productDescription: item.productDescription,
          productImage: item.productImage,
          productUnitPrice: item.productUnitPrice,
          quantity: item.quantity,
          totalPrice: item.productUnitPrice * item.quantity,
        }),
      );

      await manager.save(orderItems);

      return {
        orderId: savedOrder.id,
        status: savedOrder.status,
        totalAmount: savedOrder.totalAmount,
        paymentMethod: savedOrder.paymentMethod,
        createdAt: savedOrder.createdAt,
      };
    });
  }

  async findOrderById(userId: number, orderId: number): Promise<ListOrderDetailDto> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Pedido #${orderId} não encontrado.`);
    }

    return {
      orderId: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      shippingStreet: order.shippingStreet,
      shippingNumber: order.shippingNumber,
      shippingComplement: order.shippingComplement ?? null,
      shippingNeighborhood: order.shippingNeighborhood,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingZipCode: order.shippingZipCode,
      shippingCountry: order.shippingCountry,
      items: order.items.map((item) => ({
        id: item.id,
        productIdExternal: item.productIdExternal,
        productName: item.productName,
        productDescription: item.productDescription,
        productImage: item.productImage,
        productUnitPrice: item.productUnitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
