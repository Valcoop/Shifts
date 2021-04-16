import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Slot } from '../slots/slots.entity';
import { UserSlot } from '../slots/users-slots.entity';
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
          ...(pagination.after && { id: LessThan(pagination.after) }),
          userID,
        },
        take: pagination.first || 10,
      }),
      this.userSlotRepository.count({ where: { userID } }),
    ]);

    return [
      await this.slotRepository.find({
        where: { id: In(usersSlots.map((userSlot) => userSlot.slotID)) },
      }),
      totalCount,
    ];
  }
}
