export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  image: string
}

export interface PaginateProductsParams {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedProducts {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}
