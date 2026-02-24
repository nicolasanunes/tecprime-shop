import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderValidator } from './order.validator';
import { CreateOrderItemDto, PaymentMethod } from '../dtos/create-order.dto';
import { ListProductsDto } from '../../products/dtos/list-products.dto';

const makeItem = (productId: number, quantity: number): CreateOrderItemDto => ({
  productId,
  productName: `Produto ${productId}`,
  productDescription: 'Descrição',
  productImage: 'https://img.example.com/img.jpg',
  productUnitPrice: 100,
  quantity,
});

const makeProduct = (id: number, stock: number): ListProductsDto => ({
  id,
  name: `Produto ${id}`,
  description: 'Descrição',
  price: 100,
  stock,
  image: 'https://img.example.com/img.jpg',
});

describe('OrderValidator', () => {
  describe('validateStock', () => {
    it('não deve lançar exceção quando todos os itens têm estoque suficiente', () => {
      const items = [makeItem(1, 2), makeItem(2, 5)];
      const products = [makeProduct(1, 10), makeProduct(2, 10)];

      expect(() => OrderValidator.validateStock(items, products)).not.toThrow();
    });

    it('deve lançar NotFoundException quando um produto não está no catálogo', () => {
      const items = [makeItem(99, 1)];
      const products = [makeProduct(1, 10)];

      expect(() => OrderValidator.validateStock(items, products)).toThrow(
        NotFoundException,
      );
    });

    it('deve incluir o id do produto na mensagem da NotFoundException', () => {
      const items = [makeItem(42, 1)];
      const products = [];

      expect(() => OrderValidator.validateStock(items, products)).toThrow(
        'Produto #42 não encontrado.',
      );
    });

    it('deve lançar BadRequestException quando a quantidade excede o estoque', () => {
      const items = [makeItem(1, 11)];
      const products = [makeProduct(1, 10)];

      expect(() => OrderValidator.validateStock(items, products)).toThrow(
        BadRequestException,
      );
    });

    it('deve incluir nome do produto e quantidades na mensagem da BadRequestException', () => {
      const items = [makeItem(1, 5)];
      const products = [makeProduct(1, 3)];

      expect(() => OrderValidator.validateStock(items, products)).toThrow(
        'Estoque insuficiente para "Produto 1". Disponível: 3, solicitado: 5.',
      );
    });

    it('deve aceitar quando a quantidade é exatamente igual ao estoque', () => {
      const items = [makeItem(1, 10)];
      const products = [makeProduct(1, 10)];

      expect(() => OrderValidator.validateStock(items, products)).not.toThrow();
    });

    it('deve validar todos os itens e lançar exceção no primeiro inválido', () => {
      const items = [makeItem(1, 1), makeItem(2, 99)];
      const products = [makeProduct(1, 10), makeProduct(2, 5)];

      expect(() => OrderValidator.validateStock(items, products)).toThrow(
        BadRequestException,
      );
    });
  });
});
