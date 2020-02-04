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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'boolean' })
  isActive!: boolean;

  @ManyToOne(
    (type) => House,
    (house) => house.images, { nullable:false }
  )
  house!: House;
}
