import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class JoinForum extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ type: 'int' })
    userId!: number;

    @Column({ type: 'int' })
    hostId!: number;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
  
    @Column({ type: 'boolean' })
    isActive!: boolean;
  }
  