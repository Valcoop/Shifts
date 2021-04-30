import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  @Column()
  jobID: number;

  @Column()
  totalPlace: number;

  // TODO : handle isDelete slot
  // @Column()
  // isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserSlot, (userSlot) => userSlot.slot)
  userSlots: UserSlot[];
}
