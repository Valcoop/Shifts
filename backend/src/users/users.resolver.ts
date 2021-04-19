import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserSlotsInput } from '../graphql';
import { SlotConnection } from '../graphql-types';
import { User } from './users.entity';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private userService: UsersService) {}

  @Query()
  async user(@Args('userID') userID: string): Promise<User> {
    const user = await this.userService.findOne(userID);
    if (!user) throw new Error();

    return user;
  }

  @ResolveField()
  async slots(
    @Parent() user: User,
    @Args('input') input: UserSlotsInput,
  ): Promise<SlotConnection> {
    const [slots, totalCount] = await this.userService.getUserSlots(
      user.id,
      input,
    );

    return {
      totalCount,
      edges: slots.map((slot) => ({
        cursor: slot.id.toString(),
        node: slot,
      })),
      pageInfo: {
        // @TODO: fix me
        hasNextPage: false,
        endCursor: slots[slots.length - 1]?.id.toString(),
      },
    };
  }
}
