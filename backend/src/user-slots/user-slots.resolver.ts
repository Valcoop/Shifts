import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { UserSlot } from './user-slots.entity';

@Resolver('UserSlot')
export class UserSlotsResolver {
  constructor(private userService: UsersService) {}

  @ResolveField()
  async user(@Parent() userSlot: UserSlot): Promise<User> {
    const user = await this.userService.findOne(userSlot.id);
    // TODO: FIX ME
    if (!user) throw new Error();

    return user;
  }
}
