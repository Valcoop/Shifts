import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from '../jobs/jobs.module';
import { UserSlotsModule } from '../user-slots/user-slots.module';
import { UsersModule } from '../users/users.module';
import { Slot } from './slots.entity';
import { SlotsResolver } from './slots.resolver';
import { SlotsService } from './slots.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot]),
    JobsModule,
    UsersModule,
    UserSlotsModule,
  ],
  providers: [SlotsResolver, SlotsService],
})
export class SlotsModule {}
