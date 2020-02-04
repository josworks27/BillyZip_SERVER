import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { House } from './House';
import { User } from './User';

export type ratingGrade = 1 | 2 | 3 | 4 | 5;

@Entity()
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  comment!: string;

  @Column()
  rating!: ratingGrade;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'boolean' })
  isActive!: boolean;

  // House(1) <-> Review(*)
  @ManyToOne(
    (type) => House,
    (house) => house.reviews,
    { nullable: false },
  )
  house!: House;

  // User(1) <-> Review(*)
  @ManyToOne(
    (type) => User,
    (user) => user.reviews,
    { nullable: false },
  )
  user!: User;
}
