import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Review } from './Review';
import { Application } from './Application';
import { Favorite } from './Favorite';
import { House } from './House';

// export type userGender = 'man' | 'woman';
// export type housePlan = '30' | '50' | '70' | '100';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column()
  mobile!: string;

  @Column()
  gender!: string;

  @Column({ type: 'date' })
  birth!: string;

  @Column({ nullable: true })
  currentPlan!: string;

  @Column({ nullable: true })
  expiry!: string;

  @Column({ nullable: true })
  livingHouse!: number;

  @Column({ type: 'boolean' })
  isActive!: boolean;

  // User(1) <-> Review(*)
  @OneToMany(
    (type) => Review,
    (review) => review.user,
  )
  reviews!: Review[];

  // User(1) <-> Application(*)
  @OneToMany(
    (type) => Application,
    (application) => application.user,
  )
  applications!: Application[];

  // User(1) <-> Favorite(*)
  @OneToMany(
    (type) => Favorite,
    (favorite) => favorite.user,
  )
  favorites!: Favorite[];

  // User(1) <-> House(*)
  @OneToMany(
    (type) => House,
    (house) => house.user,
  )
  houses!: House[];
}
