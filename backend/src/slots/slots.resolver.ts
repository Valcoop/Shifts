import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {
  AddSlotInput,
  BookSlotInput,
  CancelBookedSlotInput,
  RemoveSlotInput,
  SlotsInput,
  SlotUserSlotsInput,
  UpdateSlotInput,
  UpdateUserSlotInput,
} from '../graphql';
import { UserSlotConnection } from '../graphql-types';
import { JobsService } from '../jobs/jobs.service';
import { UserSlot } from '../user-slots/user-slots.entity';
import { btoa } from '../utils';
import { Slot } from './slots.entity';
import { SlotsService } from './slots.service';

@Resolver('Slot')
export class SlotsResolver {
  constructor(
    private slotsService: SlotsService,
    private jobService: JobsService,
  ) {}

  @Query()
  slots(@Args('input') input: SlotsInput): Promise<Slot[]> {
    return this.slotsService.find(input);
  }

  @Mutation()
  async bookSlot(@Args('input') input: BookSlotInput): Promise<{ slot: Slot }> {
    return { slot: await this.slotsService.book(input) };
  }

  @Mutation()
  async cancelBookedSlot(
    @Args('input') input: CancelBookedSlotInput,
  ): Promise<{ slot: Slot }> {
    return { slot: await this.slotsService.cancelBooked(input) };
  }

  @Mutation()
  async addSlot(@Args('input') input: AddSlotInput): Promise<{ slot: Slot }> {
    return {
      slot: await this.slotsService.save({
        active: input.active,
        // TODO: Change me
        userAdminCreated: 1,
        // TODO: Change me
        lastUserAdminUpdated: 1,
        startDate: input.startDate,
        duration: input.duration,
        jobID: Number(input.jobID),
        totalPlace: input.totalPlace,
        isDeleted: false,
      }),
    };
  }

  @Mutation()
  async removeSlot(
    @Args('input') input: RemoveSlotInput,
  ): Promise<{ slot: Slot }> {
    const slot = await this.slotsService.findOne(Number(input.slotID));
    // TODO: FIX ME
    if (!slot) throw new Error();

    return { slot: await this.slotsService.delete(slot) };
  }

  @Mutation()
  async updateSlot(
    @Args('input')
    { slotID, active, duration, jobID, startDate, totalPlace }: UpdateSlotInput,
  ): Promise<{ slot: Slot }> {
    return {
      slot: await this.slotsService.update(Number(slotID), {
        // TODO: Change me
        userAdminCreated: 1,
        // TODO: Change me
        lastUserAdminUpdated: 1,
        ...(active != null ? { active } : {}),
        ...(startDate != null ? { startDate } : {}),
        ...(duration != null ? { duration } : {}),
        ...(jobID != null ? { jobID: Number(jobID) } : {}),
        ...(totalPlace != null ? { totalPlace } : {}),
      }),
    };
  }

  @Mutation()
  async updateUserSlot(
    @Args('input') { userSlotID, fullname, phoneNumber }: UpdateUserSlotInput,
  ): Promise<{ userSlot: UserSlot }> {
    return {
      userSlot: await this.slotsService.updateUserSlot(Number(userSlotID), {
        ...(fullname != null ? { fullname } : {}),
        ...(phoneNumber != null ? { phoneNumber } : {}),
      }),
    };
  }

  @ResolveField()
  job(@Parent() slot: Slot) {
    return this.jobService.findByID(slot.jobID);
  }

  @ResolveField()
  async userSlots(
    @Parent() slot: Slot,
    @Args('input') input: SlotUserSlotsInput,
  ): Promise<UserSlotConnection> {
    const [totalCount, { data: userSlots, cursor }] = await Promise.all([
      this.slotsService.countUserSlots(slot.id),
      this.slotsService.getUserSlots(slot.id, {
        first: input.first,
        after: input.after,
      }),
    ]);

    return {
      totalCount,
      edges: userSlots.map((userSlot) => ({
        cursor: `id:${btoa(userSlot.id.toString())}`,
        node: userSlot,
      })),
      pageInfo: {
        hasNextPage: Boolean(cursor.afterCursor),
        endCursor: cursor.afterCursor ?? undefined,
      },
    };
  }
}
