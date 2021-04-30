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

@Entity('user_slots')
export class UserSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userID: number;

  @ManyToOne(() => Slot, (slot) => slot.userSlots)
  @JoinColumn({ name: 'slotID' })
  slot: Slot;
  // TODO: needed ???
  slotID: number;

  @Column()
  done: boolean;

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
