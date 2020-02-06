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
import { House } from './House';

@Entity()
export class Favorite extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'boolean' })
  isActive!: boolean;

  // User(1) <-> Favorite(*)
  @ManyToOne(
    (type) => User,
    (user) => user.favorites,
    { nullable: false, onDelete: 'CASCADE' },
  )
  user!: User;

  // House(1) <-> Favorite(*)
  @ManyToOne(
    (type) => House,
    (house) => house.favorites,
    { nullable: false, onDelete: 'CASCADE' },
  )
  house!: House;
}
