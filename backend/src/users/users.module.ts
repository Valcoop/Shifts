import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from '../slots/slots.entity';
import { UserSlot } from '../user-slots/user-slots.entity';
import { User } from './users.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, User, UserSlot])],
  exports: [TypeOrmModule, UsersService],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
