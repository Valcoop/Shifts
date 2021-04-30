import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotsModule } from '../slots/slots.module';
import { UsersModule } from '../users/users.module';
import { UserSlot } from './user-slots.entity';
import { UserSlotsService } from './user-slots.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSlot]), SlotsModule, UsersModule],
  providers: [UserSlotsModule, UserSlotsService],
})
export class UserSlotsModule {}
