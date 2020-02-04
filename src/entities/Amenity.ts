import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ type: 'boolean', nullable: true })
  isActive!: boolean;
}
