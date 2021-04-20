import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';
import { Slot } from './slots.entity';
import { SlotsResolver } from './slots.resolver';
import { SlotsService } from './slots.service';
import { UserSlotAbsence } from './users-slots-absences.entity';
import { UserSlot } from './users-slots.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot, UserSlot, UserSlotAbsence]),
    JobsModule,
    UsersModule,
  ],
  providers: [SlotsResolver, SlotsService],
})
export class SlotsModule {}
