import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ListOrderDto } from '../dtos/list-order.dto';
import { ListOrderDetailDto, ListOrderItemDto } from '../dtos/list-order-detail.dto';

export class OrderMapper {
  static toListDto(order: Order): ListOrderDto {
    return {
      orderId: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    };
  }

  static toItemDto(item: OrderItem): ListOrderItemDto {
    return {
      id: item.id,
      productIdExternal: item.productIdExternal,
      productName: item.productName,
      productDescription: item.productDescription,
      productImage: item.productImage,
      productUnitPrice: item.productUnitPrice,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    };
  }

  static toDetailDto(order: Order): ListOrderDetailDto {
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
      items: order.items.map(OrderMapper.toItemDto),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
