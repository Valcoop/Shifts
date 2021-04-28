import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSlot } from './user-slots.entity';

@Injectable()
export class UserSlotsService {
  constructor(
    @InjectRepository(UserSlot)
    private userSlotRepository: Repository<UserSlot>,
  ) {}
}
