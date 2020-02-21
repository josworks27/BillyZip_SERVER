import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  subscribePlan!: string;

  @Column({ type: 'datetime' })
  paymentDate!: string;

  @Column()
  paymentOption!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'boolean' })
  isActive!: boolean;

  // User(1) <-> Payment(*)
  @ManyToOne(
    (type) => User,
    (user) => user.payments,
    { nullable: false, onDelete: 'CASCADE' },
  )
  user!: User;
}
