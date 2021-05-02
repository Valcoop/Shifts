import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Slot } from '../slots/slots.entity';
import { User } from '../users/users.entity';
import { UserSlotAbsence } from './user-slots-absences.entity';

@Entity('user_slots')
export class UserSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userID: number;

  @ManyToOne(() => User, (user) => user.userSlots)
  @JoinColumn({ name: 'userID' })
  user?: User;

  @Column({ nullable: true })
  slotID: number;

  @ManyToOne(() => Slot, (slot) => slot.userSlots)
  @JoinColumn({ name: 'slotID' })
  slot?: Slot;

  @Column()
  startDate: Date;

  @Column()
  done: boolean;

  @Column({ nullable: true })
  userSlotAbsenceID: number;

  @OneToOne(
    () => UserSlotAbsence,
    (userSlotAbsence) => userSlotAbsence.userSlot,
  )
  @JoinColumn({ name: 'userSlotAbsenceID' })
  userSlotAbsence?: UserSlotAbsence;

  @Column()
  isDeleted: boolean;

  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
