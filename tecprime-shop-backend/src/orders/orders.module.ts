import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { OrdersRepository } from './repositories/orders.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    AuthModule,
    ProductsModule,
  ],
  providers: [OrdersService, OrdersRepository],
  controllers: [OrdersController],
})
export class OrdersModule {}
