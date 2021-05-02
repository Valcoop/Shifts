import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSlot } from '../user-slots/user-slots.entity';
import { User } from './users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSlot])],
})
export class UsersModule {}
