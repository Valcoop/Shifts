import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_slots')
export class UserSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userID: number;

  @Column()
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
