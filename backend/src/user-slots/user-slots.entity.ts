import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Slot } from '../slots/slots.entity';
import { User } from '../users/users.entity';

@Entity('user_slots')
export class UserSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userSlots)
  @JoinColumn({ name: 'userID' })
  user: User;

  @ManyToOne(() => Slot, (slot) => slot.userSlots)
  @JoinColumn({ name: 'slotID' })
  slot: Slot;

  @Column()
  startDate: Date;

  @Column()
  done: boolean;

  // TODO: should we use relation
  @Column()
  userSlotAbsenceID?: number;

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
