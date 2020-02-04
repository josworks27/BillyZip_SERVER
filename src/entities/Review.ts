import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
export type ratingGrade = 1 | 2 | 3 | 4 | 5;

@Entity()
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  comment!: string;

  @Column({ type: 'int' })
  rating!: ratingGrade;

  @Column({ type: 'boolean' })
  isActive!: boolean;
}
