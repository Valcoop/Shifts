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
  async bookSlot(
    @Args('input') { userID, slotID, fullName, phoneNumber }: BookSlotInput,
  ): Promise<{ slot: Slot }> {
    return {
      slot: await this.slotsService.book(Number(userID), Number(slotID), {
        fullName: fullName,
        phoneNumber: phoneNumber,
      }),
    };
  }

  @Mutation()
  async cancelBookedSlot(
    @Args('input')
    { userSlotID, absenceTypeID, description }: CancelBookedSlotInput,
  ): Promise<{ slot: Slot }> {
    return {
      slot: await this.slotsService.cancelBooked(Number(userSlotID), {
        absenceTypeID: Number(absenceTypeID),
        description,
      }),
    };
  }

  @Mutation()
  async addSlot(
    @Args('input')
    { active, duration, jobID, startDate, totalPlace }: AddSlotInput,
  ): Promise<{ slot: Slot }> {
    return {
      slot: await this.slotsService.save({
        active,
        // TODO: Change me
        userAdminCreated: 1,
        // TODO: Change me
        lastUserAdminUpdated: 1,
        startDate,
        duration,
        jobID: Number(jobID),
        totalPlace,
        isDeleted: false,
      }),
    };
  }

  @Mutation()
  async removeSlot(
    @Args('input') { slotID }: RemoveSlotInput,
  ): Promise<{ slot: Slot }> {
    const slot = await this.slotsService.findOne(Number(slotID));
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
    @Args('input') { first, after }: SlotUserSlotsInput,
  ): Promise<UserSlotConnection> {
    const [totalCount, { data: userSlots, cursor }] = await Promise.all([
      this.slotsService.countUserSlots(slot.id),
      this.slotsService.getUserSlots(slot.id, { first, after }),
    ]);

    return {
      totalCount,
      edges: userSlots.map((userSlot) => ({
        cursor: btoa(`id:${userSlot.id.toString()}`),
        node: userSlot,
      })),
      pageInfo: {
        hasNextPage: Boolean(cursor.afterCursor),
        endCursor: cursor.afterCursor ?? undefined,
      },
    };
  }
}
