import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_slots_absences')
export class UserSlotAbsence {
  @PrimaryGeneratedColumn()
  id: number;

  // TODO: should we use relation
  @Column()
  userID: number;

  // TODO: should we use relation
  @Column()
  absenceTypeID: number;

  @Column()
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
