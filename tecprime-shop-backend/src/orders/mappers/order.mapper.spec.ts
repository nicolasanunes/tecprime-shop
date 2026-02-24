import { OrderMapper } from './order.mapper';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';

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
  quantity: 2,
  totalPrice: 9999.98,
  createdAt: mockDate,
  updatedAt: mockDate,
};

const mockOrder: Order = {
  id: 1,
  userId: 1,
  user: {} as any,
  status: 'pending',
  totalAmount: 9999.98,
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

describe('OrderMapper', () => {
  describe('toListDto', () => {
    it('deve mapear os campos corretos do pedido para o ListOrderDto', () => {
      const dto = OrderMapper.toListDto(mockOrder);

      expect(dto.orderId).toBe(mockOrder.id);
      expect(dto.status).toBe(mockOrder.status);
      expect(dto.totalAmount).toBe(mockOrder.totalAmount);
      expect(dto.paymentMethod).toBe(mockOrder.paymentMethod);
      expect(dto.createdAt).toBe(mockOrder.createdAt);
    });

    it('não deve incluir informações de itens ou endereço no ListOrderDto', () => {
      const dto = OrderMapper.toListDto(mockOrder) as any;

      expect(dto.items).toBeUndefined();
      expect(dto.shippingStreet).toBeUndefined();
    });
  });

  describe('toItemDto', () => {
    it('deve mapear todos os campos do OrderItem para o ListOrderItemDto', () => {
      const dto = OrderMapper.toItemDto(mockItem);

      expect(dto.id).toBe(mockItem.id);
      expect(dto.productIdExternal).toBe(mockItem.productIdExternal);
      expect(dto.productName).toBe(mockItem.productName);
      expect(dto.productDescription).toBe(mockItem.productDescription);
      expect(dto.productImage).toBe(mockItem.productImage);
      expect(dto.productUnitPrice).toBe(mockItem.productUnitPrice);
      expect(dto.quantity).toBe(mockItem.quantity);
      expect(dto.totalPrice).toBe(mockItem.totalPrice);
    });
  });

  describe('toDetailDto', () => {
    it('deve mapear todos os campos do pedido para o ListOrderDetailDto', () => {
      const dto = OrderMapper.toDetailDto(mockOrder);

      expect(dto.orderId).toBe(mockOrder.id);
      expect(dto.status).toBe(mockOrder.status);
      expect(dto.totalAmount).toBe(mockOrder.totalAmount);
      expect(dto.paymentMethod).toBe(mockOrder.paymentMethod);
      expect(dto.shippingStreet).toBe(mockOrder.shippingStreet);
      expect(dto.shippingNumber).toBe(mockOrder.shippingNumber);
      expect(dto.shippingComplement).toBe(mockOrder.shippingComplement);
      expect(dto.shippingNeighborhood).toBe(mockOrder.shippingNeighborhood);
      expect(dto.shippingCity).toBe(mockOrder.shippingCity);
      expect(dto.shippingState).toBe(mockOrder.shippingState);
      expect(dto.shippingZipCode).toBe(mockOrder.shippingZipCode);
      expect(dto.shippingCountry).toBe(mockOrder.shippingCountry);
      expect(dto.createdAt).toBe(mockOrder.createdAt);
      expect(dto.updatedAt).toBe(mockOrder.updatedAt);
    });

    it('deve mapear corretamente os itens do pedido', () => {
      const dto = OrderMapper.toDetailDto(mockOrder);

      expect(dto.items).toHaveLength(1);
      expect(dto.items[0].productName).toBe('Notebook Gamer');
      expect(dto.items[0].quantity).toBe(2);
      expect(dto.items[0].totalPrice).toBe(9999.98);
    });

    it('deve converter shippingComplement null para null no DTO', () => {
      const orderSemComplemento: Order = {
        ...mockOrder,
        shippingComplement: null,
      };

      const dto = OrderMapper.toDetailDto(orderSemComplemento);

      expect(dto.shippingComplement).toBeNull();
    });

    it('deve retornar array vazio de itens quando o pedido não possui itens', () => {
      const orderSemItens: Order = { ...mockOrder, items: [] };

      const dto = OrderMapper.toDetailDto(orderSemItens);

      expect(dto.items).toEqual([]);
    });
  });
});
