import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DbConfigService } from './db/db-config.service';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Address } from './addresses/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, OrderItem, Address]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DbConfigService,
      inject: [DbConfigService],
    }),
    UsersModule,
    AddressesModule,
    OrdersModule,
    ProductsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
