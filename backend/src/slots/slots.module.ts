import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from '../jobs/jobs.module';
import { UserSlotAbsence } from '../users-slots/users-slots-absences.entity';
import { UserSlot } from '../users-slots/users-slots.entity';
import { UsersModule } from '../users/users.module';
import { Slot } from './slots.entity';
import { AttendeeResolver, SlotsResolver } from './slots.resolver';
import { SlotsService } from './slots.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot, UserSlot, UserSlotAbsence]),
    JobsModule,
    UsersModule,
  ],
  providers: [SlotsResolver, AttendeeResolver, SlotsService],
})
export class SlotsModule {}
