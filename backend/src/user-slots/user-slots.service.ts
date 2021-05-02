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
}
