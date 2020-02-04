import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// User에서 만든 type plan 재활용
import { plan } from '../entities/User';
export type houseType = 'oneroom' | 'dandok' | 'apart' | 'villa' | 'offietel' | 'rest';
export type houseYear = '1' | '3' | '5' | '10' | '15' | '20' | '30' | 'rest';

@Entity()
export class House extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  plan!: plan;

  @Column({ type: 'varchar' })
  type!: houseType;

  @Column({ type: 'varchar' })
  year!: houseYear;

  @Column({ type: 'varchar' })
  access!: plan;

  @Column({ type: 'boolean' })
  status!: boolean;

  @Column({ type: 'boolean' })
  display!: boolean;

  @Column({ type: 'date', nullable: true })
  startTime!: string;

  @Column({ type: 'date', nullable: true })
  endTime!: string;

  @Column({ type: 'point' })
  location!: string;

  @Column({ type: 'varchar' })
  adminDistrict!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar' })
  description!: string;

  @Column({ type: 'varchar' })
  houseRule!: string;

  @Column({ type: 'boolean' })
  isActive!: boolean;
}
