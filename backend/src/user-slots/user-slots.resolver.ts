import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Slot } from '../slots/slots.entity';
import { SlotsService } from '../slots/slots.service';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { UserSlot } from './user-slots.entity';

@Resolver('UserSlot')
export class UserSlotsResolver {
  constructor(
    private userService: UsersService,
    private slotService: SlotsService,
  ) {}

  @ResolveField()
  async user(@Parent() userSlot: UserSlot): Promise<User> {
    const user = await this.userService.findOne(userSlot.id);
    // TODO: FIX ME
    if (!user) throw new Error();

    return user;
  }

  @ResolveField()
  async slot(@Parent() userSlot: UserSlot): Promise<Slot> {
    const slot = await this.slotService.findOne(userSlot.slotID);
    // TODO: FIX ME
    if (!slot) throw new Error();

    return slot;
  }
}
