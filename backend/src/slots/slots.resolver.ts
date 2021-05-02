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
} from '../graphql';
import { UserSlotConnection } from '../graphql-types';
import { JobsService } from '../jobs/jobs.service';
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
    const job = await this.jobService.findByID(Number(jobID));
    // TODO: FIX ME
    if (!job) throw new Error();

    return {
      slot: await this.slotsService.save({
        active,
        // TODO: Change me
        userAdminCreated: 1,
        // TODO: Change me
        lastUserAdminUpdated: 1,
        startDate,
        duration,
        job,
        totalPlace,
        isDeleted: false,
      }),
    };
  }

  @Mutation()
  async removeSlot(
    @Args('input') { slotID }: RemoveSlotInput,
  ): Promise<{ slot: Slot }> {
    const slot = await this.slotsService.findByID(Number(slotID));
    // TODO: FIX ME
    if (!slot) throw new Error();

    return { slot: await this.slotsService.delete(slot) };
  }

  @Mutation()
  async updateSlot(
    @Args('input')
    { slotID, active, duration, jobID, startDate, totalPlace }: UpdateSlotInput,
  ): Promise<{ slot: Slot }> {
    const [slot, job] = await Promise.all([
      this.slotsService.findByID(Number(slotID)),
      jobID ? this.jobService.findByID(Number(jobID)) : undefined,
    ]);
    // TODO: FIX ME
    if (!slot) throw new Error();
    // TODO: FIX ME
    if (jobID && !job) throw new Error();

    return {
      slot: await this.slotsService.update(slot, {
        // TODO: Change me
        lastUserAdminUpdated: 1,
        ...(active != null ? { active } : {}),
        ...(startDate != null ? { startDate } : {}),
        ...(duration != null ? { duration } : {}),
        ...(job != null ? { job } : {}),
        ...(totalPlace != null ? { totalPlace } : {}),
      }),
    };
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
