import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSlot } from './user-slots.entity';

interface UserSlotDAO {
  fullName: string;
  phoneNumber: string;
  startDate: Date;
}
@Injectable()
export class UserSlotsService {
  constructor(
    @InjectRepository(UserSlot)
    private userSlotRepository: Repository<UserSlot>,
  ) {}

  updateUserSlot(id: number, userSlotDAO: Partial<UserSlotDAO>) {
    return this.userSlotRepository.save(
      this.userSlotRepository.create({
        id,
        ...userSlotDAO,
      }),
    );
  }
}
