/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import { Amenity } from './Amenity';
import { Image } from './Image';
import { Review } from './Review';
import { User } from './User';
import { Favorite } from './Favorite';
import { Application } from './Application';

@Entity()
export class House extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  plan!: string;

  @Column()
  type!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'int' })
  access!: number;

  @Column({ type: 'boolean' })
  status!: boolean;

  @Column({ type: 'boolean' })
  display!: boolean;

  @Column({ nullable: true })
  startTime!: number;

  @Column({ nullable: true })
  endTime!: number;

  // @Column({ type: 'geometry', spatialFeatureType: 'point', srid: 4326 })
  // location!: string;

  @Column('simple-array')
  location!: number[];

  @Column()
  adminDistrict!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  houseRule!: string;

  @Column({ type: 'boolean' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // House(1) <-> Amenity(1)
  @OneToOne((type) => Amenity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  amenity!: Amenity;

  // House(1) <-> Image(*)
  @OneToMany(
    (type) => Image,
    (image) => image.house,
  )
  images!: Image[];

  // House(1) <-> Review(*)
  @OneToMany(
    (type) => Review,
    (review) => review.house,
  )
  reviews!: Review[];

  // House(1) <-> Favorite(*)
  @OneToMany(
    (type) => Favorite,
    (favorite) => favorite.house,
  )
  favorites!: Favorite[];

  // House(1) <-> Application(*)
  @OneToMany(
    (type) => Application,
    (application) => application.house,
  )
  applications!: Application[];

  // User(1) <-> House(*)
  @ManyToOne(
    (type) => User,
    (user) => user.houses,
    { nullable: false, onDelete: 'CASCADE' },
  )
  user!: User;
  avgRating!: number;
  favsNow!: boolean;
}
