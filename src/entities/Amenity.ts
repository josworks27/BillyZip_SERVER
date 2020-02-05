import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Amenity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'boolean', nullable: true })
  secondFloor!: boolean;

  @Column({ type: 'boolean', nullable: true })
  parking!: boolean;

  @Column({ type: 'boolean', nullable: true })
  aircon!: boolean;

  @Column({ type: 'boolean', nullable: true })
  autoLock!: boolean;

  @Column({ type: 'boolean', nullable: true })
  tv!: boolean;

  @Column({ type: 'boolean', nullable: true })
  bed!: boolean;

  @Column({ type: 'boolean', nullable: true })
  washing!: boolean;

  @Column({ type: 'boolean', nullable: true })
  allowPet!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'boolean' })
  isActive!: boolean;
}
