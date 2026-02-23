export class ListOrderItemDto {
  id: number;
  productIdExternal: number;
  productName: string;
  productDescription: string;
  productImage: string;
  productUnitPrice: number;
  quantity: number;
  totalPrice: number;
}

export class ListOrderDetailDto {
  orderId: number;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  shippingStreet: string;
  shippingNumber: string;
  shippingComplement: string | null;
  shippingNeighborhood: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  items: ListOrderItemDto[];
  createdAt: Date;
  updatedAt: Date;
}
