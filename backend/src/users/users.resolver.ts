import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserUserSlotsInput } from '../graphql';
import { UserSlotConnection } from '../graphql-types';
import { User } from './users.entity';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private userService: UsersService) {}

  @Query()
  async user(@Args('userID') userID: string): Promise<User> {
    const user = await this.userService.findOne(Number(userID));
    if (!user) throw new Error();

    return user;
  }

  @ResolveField()
  async userSlots(
    @Parent() user: User,
    @Args('input') input: UserUserSlotsInput,
  ): Promise<UserSlotConnection> {
    // @ts-ignore
    const { data: userSlots, cursor } = await this.userService.getUserSlots(
      user.id,
      { startDate: input.stardDate },
      { first: input.first, after: input.after },
    );

    return {
      totalCount: 0,
      edges: userSlots.map((userSlot) => ({
        cursor: userSlot.id.toString(),
        node: userSlot,
      })),
      pageInfo: {
        // @TODO: fix me
        hasNextPage: false,
        endCursor: userSlots[userSlots.length - 1]?.id.toString(),
      },
    };
  }
}
