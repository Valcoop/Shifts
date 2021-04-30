import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from '../slots/slots.entity';
import { UserSlot } from '../user-slots/user-slots.entity';
import { User } from './users.entity';
import { buildPaginator } from 'typeorm-cursor-pagination';

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

  getUserSlots(
    userID: number,
    { startDate }: { startDate?: Date },
    pagination: { first?: number; after?: string },
  ) {
    const queryBuilder = this.userSlotRepository
      .createQueryBuilder('user_slot')
      .innerJoinAndSelect('user_slot.slot', 'slot')
      .where('user_slot.userID = :userID', { userID })
      .andWhere('user_slot.isDeleted = false')
      .andWhere('slot.isDeleted = false');

    if (startDate)
      queryBuilder.andWhere('user_slot.startDate >= :startDate', { startDate });

    const nextPaginator = buildPaginator({
      entity: UserSlot,
      alias: 'user_slot',
      paginationKeys: ['id', 'startDate'],
      query: {
        limit: pagination.first,
        order: 'ASC',
        afterCursor: pagination.after,
      },
    });

    return nextPaginator.paginate(queryBuilder);
  }
}
