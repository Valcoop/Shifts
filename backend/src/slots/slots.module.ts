import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from '../jobs/jobs.module';
import { UserSlot } from '../user-slots/user-slots.entity';
import { UserSlotsService } from '../user-slots/user-slots.service';
import { UsersService } from '../users/users.service';
import { Slot } from './slots.entity';
import { SlotsResolver } from './slots.resolver';
import { SlotsService } from './slots.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot, UserSlot]),
    JobsModule,
    UsersService,
    UserSlotsService,
  ],
  providers: [SlotsResolver, SlotsService],
})
export class SlotsModule {}
