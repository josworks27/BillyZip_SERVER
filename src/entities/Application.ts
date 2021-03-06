/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { House } from './House';

@Entity()
export class Application extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: 'wait' })
  status!: string;

  @Column({ default: false })
  completed!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'boolean' })
  isActive!: boolean;

  // User(1) <-> Application(*)
  @ManyToOne(
    (type) => User,
    (user) => user.applications,
    { nullable: false, onDelete: 'CASCADE' },
  )
  user!: User;

  // House(1) <-> Application(*)
  @ManyToOne(
    (type) => House,
    (house) => house.applications,
    { nullable: false, onDelete: 'CASCADE' },
  )
  house!: House;
}
