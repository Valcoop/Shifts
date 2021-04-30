import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from '../slots/slots.entity';
import { UserSlot } from '../user-slots/user-slots.entity';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    // @ts-ignore
    @InjectRepository(Slot) private slotRepository: Repository<Slot>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserSlot)
    private userSlotRepository: Repository<UserSlot>,
  ) {}

  findOne(userID: number) {
    return this.userRepository.findOne(userID);
  }

  getUserSlots(userID: number, { startDate }: { startDate?: Date }) {
    const queryBuilder = this.userSlotRepository
      .createQueryBuilder('user_slot')
      .innerJoinAndSelect('user_slot.slot', 'slot')
      .where('user_slot.userID = :userID', { userID })
      .andWhere('user_slot.isDeleted = false');
    // TODO : handle isDelete slot
    // .andWhere('slot.isDelete = false')

    if (startDate)
      queryBuilder.andWhere('slot.startDate >= :startDate', { startDate });

    return queryBuilder.getMany();
  }
}
