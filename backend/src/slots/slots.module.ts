import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from '../jobs/jobs.module';
import { UserSlotAbsence } from '../user-slots/user-slots-absences.entity';
import { UserSlot } from '../user-slots/user-slots.entity';
import { User } from '../users/users.entity';
import { Slot } from './slots.entity';
import { SlotsResolver } from './slots.resolver';
import { SlotsService } from './slots.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot, User, UserSlot, UserSlotAbsence]),
    JobsModule,
  ],
  providers: [SlotsResolver, SlotsService],
})
export class SlotsModule {}
