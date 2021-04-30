import { Module } from '@nestjs/common';
import { UserSlotsService } from './user-slots.service';

@Module({
  imports: [],
  providers: [UserSlotsModule, UserSlotsService],
})
export class UserSlotsModule {}
