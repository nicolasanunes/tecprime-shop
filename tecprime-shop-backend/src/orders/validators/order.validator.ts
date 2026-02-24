import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderItemDto } from '../dtos/create-order.dto';
import { ListProductsDto } from '../../products/dtos/list-products.dto';

export class OrderValidator {
  static validateStock(items: CreateOrderItemDto[], products: ListProductsDto[]): void {
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new NotFoundException(`Produto #${item.productId} não encontrado.`);
      }

      if (item.quantity > product.stock) {
        throw new BadRequestException(
          `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}, solicitado: ${item.quantity}.`,
        );
      }
    }
  }
}
