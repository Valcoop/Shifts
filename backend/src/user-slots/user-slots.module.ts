import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSlotAbsence } from './user-slots-absences.entity';
import { UserSlot } from './user-slots.entity';
import { UserSlotsService } from './user-slots.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSlot, UserSlotAbsence])],
  providers: [UserSlotsModule, UserSlotsService],
})
export class UserSlotsModule {}
