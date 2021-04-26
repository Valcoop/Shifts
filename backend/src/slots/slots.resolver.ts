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
  SlotAttendeesInput,
  SlotsInput,
  UpdateSlotInput,
} from '../graphql';
import { AttendeeConnection } from '../graphql-types';
import { JobsService } from '../jobs/jobs.service';
import { Slot } from './slots.entity';
import { SlotsService } from './slots.service';

@Resolver('Slot')
export class SlotsResolver {
  constructor(
    private slotsService: SlotsService,
    private jobService: JobsService,
  ) {}

  @Query()
  async slots(@Args('input') input: SlotsInput): Promise<Slot[]> {
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
      }),
    };
  }

  @Mutation()
  async removeSlot(
    @Args('input') input: RemoveSlotInput,
  ): Promise<{ slot: Slot }> {
    return { slot: await this.slotsService.remove(Number(input.slotID)) };
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

  @ResolveField()
  async attendees(
    @Parent() slot: Slot,
    @Args('input') input: SlotAttendeesInput,
  ): Promise<AttendeeConnection> {
    const [
      attendees,
      totalCount,
    ] = await this.slotsService.getAttendeesAndCount(slot.id, input);

    return {
      totalCount,
      edges: attendees.map((attendee) => ({
        cursor: attendee.id.toString(),
        node: attendee,
      })),
      pageInfo: {
        // @TODO: fix me
        hasNextPage: false,
        endCursor: attendees[attendees.length - 1]?.id.toString(),
      },
    };
  }

  @ResolveField()
  job(@Parent() slot: Slot) {
    return this.jobService.findByID(slot.jobID);
  }
}
