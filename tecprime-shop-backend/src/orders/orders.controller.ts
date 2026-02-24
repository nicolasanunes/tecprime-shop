import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { ListOrderDto } from './dtos/list-order.dto';
import { ListOrderDetailDto } from './dtos/list-order-detail.dto';
import { MeResponseDto } from '../auth/dtos/me-response.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Req() request: Request & { user: MeResponseDto },
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<ListOrderDto> {
    return this.ordersService.createOrder(request.user.id, createOrderDto);
  }

  @Get(':id')
  async findOrder(
    @Req() request: Request & { user: MeResponseDto },
    @Param('id', ParseIntPipe) orderId: number,
  ): Promise<ListOrderDetailDto> {
    return this.ordersService.findOrderById(request.user.id, orderId);
  }
}
