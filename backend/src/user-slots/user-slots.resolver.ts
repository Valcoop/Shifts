import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../decorator/user.decorator';
import { UpdateUserSlotInput } from '../graphql';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../users/users.entity';
import { UserSlot } from './user-slots.entity';
import { UserSlotsService } from './user-slots.service';

@Resolver('UserSlot')
export class UserSlotsResolver {
  constructor(private userSlotsService: UserSlotsService) {}

  @Mutation()
  @UseGuards(AuthGuard)
  async updateUserSlot(
    @CurrentUser() user: User,
    @Args('input') { userSlotID, fullName, phoneNumber }: UpdateUserSlotInput,
  ): Promise<{ userSlot: UserSlot }> {
    const userSlot = await this.userSlotsService.findByID(Number(userSlotID));
    // TODO: FIX ME
    if (!userSlot) throw new Error();
    // TODO: FIX ME
    if (userSlot.userID !== user.id) throw new Error();

    return {
      userSlot: await this.userSlotsService.update(userSlot, {
        ...(fullName != null ? { fullName } : {}),
        ...(phoneNumber != null ? { phoneNumber } : {}),
      }),
    };
  }
}
