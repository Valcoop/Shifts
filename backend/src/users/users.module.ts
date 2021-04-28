import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from '../slots/slots.entity';
import { UserSlot } from '../users-slots/users-slots.entity';
import { User } from './users.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, User, UserSlot])],
  exports: [TypeOrmModule],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
