import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'bigint' })
  id: number;

  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'bigint', nullable: false })
  userId: number;

  @Column({ name: 'street', type: 'varchar', length: 255, nullable: false })
  street: string;

  @Column({ name: 'number', type: 'varchar', length: 20, nullable: false })
  number: string;

  @Column({ name: 'complement', type: 'varchar', length: 150, nullable: true })
  complement: string;

  @Column({
    name: 'neighborhood',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  neighborhood: string;

  @Column({ name: 'city', type: 'varchar', length: 150, nullable: false })
  city: string;

  @Column({ name: 'state', type: 'varchar', length: 150, nullable: false })
  state: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 20, nullable: false })
  zipCode: string;

  @Column({ name: 'country', type: 'varchar', length: 150, nullable: false })
  country: string;

  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
