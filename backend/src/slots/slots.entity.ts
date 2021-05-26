import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Job } from '../jobs/jobs.entity';
import { UserSlot } from '../user-slots/user-slots.entity';

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

  @Column({ nullable: true })
  jobID: number;

  @ManyToOne(() => Job, (job) => job.slots)
  @JoinColumn({ name: 'jobID' })
  job?: Job;

  @Column()
  totalPlace: number;

  @Column()
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserSlot, (userSlot) => userSlot.slot)
  userSlots: UserSlot[];
}
