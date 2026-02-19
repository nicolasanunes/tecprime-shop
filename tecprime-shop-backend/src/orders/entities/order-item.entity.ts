import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'bigint' })
  id: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id', type: 'bigint', nullable: false })
  orderId: number;

  @Column({ name: 'product_id_external', type: 'bigint', nullable: false })
  productIdExternal: number;

  @Column({
    name: 'product_name',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  productName: string;

  @Column({
    name: 'product_description',
    type: 'text',
    nullable: false,
  })
  productDescription: string;

  @Column({
    name: 'product_image',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  productImage: string;

  @Column({
    name: 'product_unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  productUnitPrice: number;

  @Column({
    name: 'quantity',
    type: 'int',
    nullable: false,
  })
  quantity: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
