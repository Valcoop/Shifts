import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  active: boolean;

  @Column()
  userAdminCreated: number;

  @Column()
  lastUserAdminUpdated: number;

  @Column()
  startDate: Date;

  @Column()
  duration: number;

  @Column()
  jobID: number;

  @Column()
  totalPlace: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
