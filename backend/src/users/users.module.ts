import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSlot } from '../user-slots/user-slots.entity';
import { User } from './users.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSlot])],
  exports: [UsersService],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
