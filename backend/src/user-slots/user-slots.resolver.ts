import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UpdateUserSlotInput } from '../graphql';
import { UserSlot } from './user-slots.entity';
import { UserSlotsService } from './user-slots.service';

@Resolver('UserSlot')
export class UserSlotsResolver {
  constructor(private userSlotsService: UserSlotsService) {}

  @Mutation()
  async updateUserSlot(
    @Args('input') { userSlotID, fullName, phoneNumber }: UpdateUserSlotInput,
  ): Promise<{ userSlot: UserSlot }> {
    const userSlot = await this.userSlotsService.findByID(Number(userSlotID));
    // TODO: FIX ME
    if (!userSlot) throw new Error();

    return {
      userSlot: await this.userSlotsService.update(userSlot, {
        ...(fullName != null ? { fullName } : {}),
        ...(phoneNumber != null ? { phoneNumber } : {}),
      }),
    };
  }
}
