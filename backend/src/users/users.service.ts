import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Slot } from '../slots/slots.entity';
import { UserSlot } from '../user-slots/user-slots.entity';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Slot) private slotRepository: Repository<Slot>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserSlot)
    private userSlotRepository: Repository<UserSlot>,
  ) {}

  findOne(userID: string) {
    return this.userRepository.findOne(userID);
  }

  async getUserSlots(
    userID: number,
    pagination: { first?: number; after?: string },
  ): Promise<[Slot[], number]> {
    const [usersSlots, totalCount] = await Promise.all([
      this.userSlotRepository.find({
        where: {
          userID,
          isDeleted: false,
          ...(pagination.after && { id: LessThan(pagination.after) }),
        },
        take: pagination.first || 10,
      }),
      this.userSlotRepository.count({ where: { userID, isDeleted: false } }),
    ]);

    return [
      await this.slotRepository.find({
        where: { id: In(usersSlots.map((userSlot) => userSlot.slotID)) },
      }),
      totalCount,
    ];
  }
}
