import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserUserSlotsInput } from '../graphql';
import { UserSlotConnection } from '../graphql-types';
import { btoa } from '../utils';
import { User } from './users.entity';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private userService: UsersService) {}

  @Query()
  async user(@Args('userID') userID: string): Promise<User> {
    const user = await this.userService.findByID(Number(userID));
    if (!user) throw new Error();

    return user;
  }

  @ResolveField()
  async userSlots(
    @Parent() user: User,
    @Args('input') input: UserUserSlotsInput,
  ): Promise<UserSlotConnection> {
    const [totalCount, { data: userSlots, cursor }] = await Promise.all([
      this.userService.countUserSlots(user.id),
      this.userService.getUserSlots(
        user.id,
        { startDate: input.startDate },
        { first: input.first, after: input.after },
      ),
    ]);

    return {
      totalCount,
      edges: userSlots.map((userSlot) => ({
        cursor: btoa(
          `id:${userSlot.id.toString()},startDate:${userSlot.startDate
            .getTime()
            .toString()}`,
        ),
        node: userSlot,
      })),
      pageInfo: {
        hasNextPage: Boolean(cursor.afterCursor),
        endCursor: cursor.afterCursor ?? undefined,
      },
    };
  }
}
