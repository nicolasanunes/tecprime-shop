import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'bigint' })
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'bigint', nullable: false })
  userId: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: 'pending',
    nullable: false,
  })
  status: string;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalAmount: number;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  paymentMethod: string;

  @Column({
    name: 'shipping_street',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  shippingStreet: string;

  @Column({
    name: 'shipping_number',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  shippingNumber: string;

  @Column({
    name: 'shipping_complement',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  shippingComplement: string;

  @Column({
    name: 'shipping_neighborhood',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  shippingNeighborhood: string;

  @Column({
    name: 'shipping_city',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  shippingCity: string;

  @Column({
    name: 'shipping_state',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  shippingState: string;

  @Column({
    name: 'shipping_zip_code',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  shippingZipCode: string;

  @Column({
    name: 'shipping_country',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  shippingCountry: string;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
