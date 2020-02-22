/* eslint-disable @typescript-eslint/no-unused-vars */
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

@Entity()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  filePath!: string;

  @Column()
  fileName!: string;

  @Column({ type: 'boolean'})
  mainImage!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'boolean' })
  isActive!: boolean;

  // House(1) <-> Image(*)
  @ManyToOne(
    (type) => House,
    (house) => house.images, { nullable: false, onDelete: 'CASCADE' }
  )
  house!: House;
}
