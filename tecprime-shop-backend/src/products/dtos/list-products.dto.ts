export class ListProductsFromExternalApiDto {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

export class ListProductsDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}
