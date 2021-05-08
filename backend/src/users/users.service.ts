import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { NextcloudUser } from '../auth/auth.controller';
import { UserSlot } from '../user-slots/user-slots.entity';
import { User } from './users.entity';

interface UserDAO {
  externalID: string;
  fullName: string;
  phoneNumber?: string;
  isAdmin: boolean;
  token?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserSlot)
    private userSlotRepository: Repository<UserSlot>,
  ) {}

  create(userDAO: UserDAO): Promise<User> {
    return this.userRepository.save(this.userRepository.create(userDAO));
  }

  findByID(id: number): Promise<User | undefined> {
    return this.userRepository.findOne(id);
  }

  findOne(filters: FindOneOptions<User>): Promise<User | undefined> {
    return this.userRepository.findOne(filters);
  }

  countUserSlots(userID: number) {
    return this.userSlotRepository
      .createQueryBuilder('user_slot')
      .innerJoinAndSelect('user_slot.slot', 'slot')
      .innerJoinAndSelect('user_slot.user', 'user')
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
      .innerJoinAndSelect('user_slot.user', 'user')
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

  syncNextcloud(
    user: User,
    externalUser: NextcloudUser['ocs']['data'] & { token: string },
  ): Promise<User> | User {
    const toUpdateFields: Partial<UserDAO> = {};

    if (externalUser.displayname !== user.fullName) {
      toUpdateFields.fullName = externalUser.displayname;
    }
    if (externalUser.id !== user.externalID) {
      toUpdateFields.externalID = externalUser.id;
    }
    if (externalUser.phone !== user.phoneNumber) {
      toUpdateFields.phoneNumber = externalUser.phone;
    }
    if (externalUser.token !== user.token) {
      toUpdateFields.token = externalUser.token;
    }
    //TODO: handle isAdmin

    return Object.keys(toUpdateFields).length
      ? this.userRepository.save(
          this.userRepository.create({ ...user, ...toUpdateFields }),
        )
      : user;
  }
}
