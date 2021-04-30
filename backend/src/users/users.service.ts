import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { UserSlot } from '../user-slots/user-slots.entity';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserSlot)
    private userSlotRepository: Repository<UserSlot>,
  ) {}

  findOne(userID: number) {
    return this.userRepository.findOne(userID);
  }

  countUserSlots(userID: number) {
    return this.userSlotRepository
      .createQueryBuilder('user_slot')
      .innerJoinAndSelect('user_slot.slot', 'slot')
      .where('user_slot.userID = :userID', { userID })
      .andWhere('user_slot.isDeleted = false')
      .andWhere('slot.isDeleted = false')
      .getCount();
  }

  getUserSlots(
    userID: number,
    { startDate }: { startDate?: Date },
    pagination?: { first?: number; after?: string },
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
        limit: pagination?.first || 10,
        order: 'ASC',
        afterCursor: pagination?.after,
      },
    });

    return nextPaginator.paginate(queryBuilder);
  }
}
