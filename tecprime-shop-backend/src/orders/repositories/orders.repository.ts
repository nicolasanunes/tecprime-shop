import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';

export interface CreateOrderData {
  userId: number;
  paymentMethod: string;
  totalAmount: number;
  shippingStreet: string;
  shippingNumber: string;
  shippingComplement?: string;
  shippingNeighborhood: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  items: CreateOrderItemData[];
}

export interface CreateOrderItemData {
  productIdExternal: number;
  productName: string;
  productDescription: string;
  productImage: string;
  productUnitPrice: number;
  quantity: number;
  totalPrice: number;
}

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async createWithItems(data: CreateOrderData): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        userId: data.userId,
        paymentMethod: data.paymentMethod,
        totalAmount: data.totalAmount,
        shippingStreet: data.shippingStreet,
        shippingNumber: data.shippingNumber,
        shippingComplement: data.shippingComplement,
        shippingNeighborhood: data.shippingNeighborhood,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingZipCode: data.shippingZipCode,
        shippingCountry: data.shippingCountry,
      });

      const savedOrder = await manager.save(order);

      const orderItems = data.items.map((item) =>
        manager.create(OrderItem, {
          orderId: savedOrder.id,
          productIdExternal: item.productIdExternal,
          productName: item.productName,
          productDescription: item.productDescription,
          productImage: item.productImage,
          productUnitPrice: item.productUnitPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        }),
      );

      await manager.save(orderItems);

      return savedOrder;
    });
  }

  async findByIdAndUser(orderId: number, userId: number): Promise<Order | null> {
    return this.repository.findOne({
      where: { id: orderId, userId },
      relations: ['items'],
    });
  }
}
