import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from '../slots/slots.entity';
import { User } from '../users/users.entity';
import { UserSlotAbsence } from './user-slots-absences.entity';
import { UserSlot } from './user-slots.entity';

interface UserSlotDAO {
  done: boolean;
  user: User;
  slot: Slot;
  fullName: string;
  phoneNumber: string;
  startDate: Date;
  isDeleted: boolean;
}
@Injectable()
export class UserSlotsService {
  constructor(
    @InjectRepository(UserSlot)
    private userSlotRepository: Repository<UserSlot>,
    @InjectRepository(UserSlot)
    private userSlotAbsenceRepository: Repository<UserSlotAbsence>,
  ) {}

  async cancel(
    userSlot: UserSlot,
    {
      absenceTypeID,
      description,
    }: { absenceTypeID: number; description?: string },
  ): Promise<UserSlot> {
    const userSlotAbsence = await this.userSlotAbsenceRepository.save(
      this.userSlotAbsenceRepository.create({
        userID: userSlot.userID,
        absenceTypeID,
        description,
      }),
    );

    return this.userSlotRepository.save({
      id: userSlot.id,
      userSlotAbsenceID: userSlotAbsence.id,
      isDeleted: true,
    });
  }

  findByID(id: number): Promise<UserSlot | undefined> {
    return this.userSlotRepository.findOne(id, { relations: ['slot', 'user'] });
  }

  update(
    userSlot: UserSlot,
    userSlotDAO: Partial<UserSlotDAO>,
  ): Promise<UserSlot> {
    return this.userSlotRepository.save(
      this.userSlotRepository.create({ ...userSlot, ...userSlotDAO }),
    );
  }

  save(userSlotDAO: UserSlotDAO): Promise<UserSlot> {
    return this.userSlotRepository.save(
      this.userSlotRepository.create(userSlotDAO),
    );
  }
}
