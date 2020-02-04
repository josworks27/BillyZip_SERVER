import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
export type userGender = 'man' | 'woman';
export type plan = '30' | '50' | '70' | '100';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  mobile!: string;

  @Column({ type: 'varchar' })
  gender!: userGender;

  @Column({ type: 'date' })
  birth!: string;

  @Column({ type: 'varchar', nullable: true })
  currentPlan!: plan;

  @Column({ type: 'date', nullable: true })
  expiry!: string;

  @Column({ type: 'int', nullable: true })
  livingHouse!: number;

  @Column({ type: 'boolean' })
  isActive!: boolean;
}
