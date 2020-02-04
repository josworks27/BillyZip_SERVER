import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  filePath!: string;

  @Column({ type: 'varchar' })
  fileName!: string;

  @Column({ type: 'boolean' })
  isActive!: boolean;
}
