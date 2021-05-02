import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSlotAbsence } from './user-slots-absences.entity';
import { UserSlot } from './user-slots.entity';
import { UserSlotsResolver } from './user-slots.resolver';
import { UserSlotsService } from './user-slots.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSlot, UserSlotAbsence])],
  exports: [UserSlotsService],
  providers: [UserSlotsResolver, UserSlotsService],
})
export class UserSlotsModule {}
