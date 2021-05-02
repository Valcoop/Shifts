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
import { AbsenceType } from '../absence-types/absence-types.entity';
import { User } from '../users/users.entity';
import { UserSlot } from './user-slots.entity';

@Entity('user_slots_absences')
export class UserSlotAbsence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userID: number;

  @ManyToOne(() => User, (user) => user.userSlotAbsences)
  @JoinColumn({ name: 'userID' })
  user?: User;

  @Column({ nullable: true })
  absenceTypeID: number;

  @ManyToOne(() => AbsenceType, (absenceType) => absenceType.userSlotAbsences)
  @JoinColumn({ name: 'absenceTypeID' })
  absenceType?: AbsenceType;

  @Column()
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserSlot, (userSlot) => userSlot.userSlotAbsence)
  userSlot?: UserSlot;
}
