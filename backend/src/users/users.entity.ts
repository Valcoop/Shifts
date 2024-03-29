import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSlotAbsence } from '../user-slots/user-slots-absences.entity';
import { UserSlot } from '../user-slots/user-slots.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  externalID: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column()
  isAdmin: boolean;

  @Column({ nullable: true })
  token?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserSlot, (userSlot) => userSlot.slot)
  userSlots: UserSlot[];

  @OneToMany(() => UserSlotAbsence, (userSlotAbsence) => userSlotAbsence.user)
  userSlotAbsences: UserSlotAbsence[];
}
