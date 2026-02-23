import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  PIX = 'Pix',
  CARTAO = 'Cartão',
  BOLETO = 'Boleto',
}
 
export class CreateOrderShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderItemDto {
  @IsNumber()
  productId: number;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  productDescription: string;

  @IsString()
  @IsNotEmpty()
  productImage: string;

  @IsNumber()
  @IsPositive()
  productUnitPrice: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ValidateNested()
  @Type(() => CreateOrderShippingAddressDto)
  shippingAddress: CreateOrderShippingAddressDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
