export enum PaymentMethod {
  PIX = 'Pix',
  CARTAO = 'Cartão',
  BOLETO = 'Boleto',
}

export interface CreateOrderShippingAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface CreateOrderItem {
  productId: number
  productName: string
  productDescription: string
  productImage: string
  productUnitPrice: number
  quantity: number
}

export interface CreateOrder {
  paymentMethod: PaymentMethod
  shippingAddress: CreateOrderShippingAddress
  items: CreateOrderItem[]
}

export interface ListOrder {
  orderId: number
  status: string
  totalAmount: number
  paymentMethod: string
  createdAt: string
}

export interface ListOrderItem {
  id: number
  productIdExternal: number
  productName: string
  productDescription: string
  productImage: string
  productUnitPrice: number
  quantity: number
  totalPrice: number
}

export interface ListOrderDetail {
  orderId: number
  status: string
  totalAmount: number
  paymentMethod: string
  shippingStreet: string
  shippingNumber: string
  shippingComplement: string | null
  shippingNeighborhood: string
  shippingCity: string
  shippingState: string
  shippingZipCode: string
  shippingCountry: string
  items: ListOrderItem[]
  createdAt: string
  updatedAt: string
}
