import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserSlotAbsence } from '../user-slots/user-slots-absences.entity';

@Entity('absence_types')
export class AbsenceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => UserSlotAbsence,
    (userSlotAbsence) => userSlotAbsence.absenceType,
  )
  userSlotAbsences: UserSlotAbsence[];
}
