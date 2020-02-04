import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Application extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'boolean' })
  isActive!: boolean;
}