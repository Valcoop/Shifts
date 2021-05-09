import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Roles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/user.decorator';
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
import { AuthGuard } from '../guards/auth.guard';
import { Job } from '../jobs/jobs.entity';
import { JobsService } from '../jobs/jobs.service';
import { UserSlot } from '../user-slots/user-slots.entity';
import { UserSlotsService } from '../user-slots/user-slots.service';
import { User } from '../users/users.entity';
import { btoa } from '../utils';
import { Slot } from './slots.entity';
import { SlotsService } from './slots.service';

@Resolver('Slot')
export class SlotsResolver {
  constructor(
    private slotsService: SlotsService,
    private jobsService: JobsService,
    private userSlotsService: UserSlotsService,
  ) {}

  @Query()
  slots(@Args('input') input: SlotsInput): Promise<Slot[]> {
    return this.slotsService.find(input);
  }

  @Mutation()
  @UseGuards(AuthGuard)
  async bookSlot(
    @CurrentUser() user: User,
    @Args('input') { slotID, fullName, phoneNumber }: BookSlotInput,
  ): Promise<{ userSlot: UserSlot }> {
    const slot = await this.slotsService.findByID(Number(slotID));
    // TODO: FIX ME
    if (!slot || !slot.active || slot.isDeleted) throw new Error();

    return {
      userSlot: await this.userSlotsService.save({
        done: false,
        user,
        slot,
        fullName,
        phoneNumber,
        startDate: slot.startDate,
        isDeleted: false,
      }),
    };
  }

  @Mutation()
  @UseGuards(AuthGuard)
  async cancelBookedSlot(
    @CurrentUser() user: User,
    @Args('input')
    { userSlotID, absenceTypeID, description }: CancelBookedSlotInput,
  ): Promise<{ userSlot: UserSlot }> {
    const userSlot = await this.userSlotsService.findByID(Number(userSlotID));
    // TODO: FIX ME
    if (!userSlot) throw new Error();
    // TODO: FIX ME
    if (userSlot.userSlotAbsenceID) throw new Error();
    // TODO: FIX ME
    if (userSlot.userID !== user.id) throw new Error();

    return {
      userSlot: await this.userSlotsService.cancel(userSlot, {
        absenceTypeID: Number(absenceTypeID),
        description,
      }),
    };
  }

  @Mutation()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async addSlot(
    @Args('input')
    { active, duration, jobID, startDate, totalPlace }: AddSlotInput,
  ): Promise<{ slot: Slot }> {
    const job = await this.jobsService.findByID(Number(jobID));
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
  @UseGuards(AuthGuard)
  @Roles('admin')
  async removeSlot(
    @Args('input') { slotID }: RemoveSlotInput,
  ): Promise<{ slot: Slot }> {
    const slot = await this.slotsService.findByID(Number(slotID));
    // TODO: FIX ME
    if (!slot) throw new Error();

    return { slot: await this.slotsService.delete(slot) };
  }

  @Mutation()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async updateSlot(
    @Args('input')
    { slotID, active, duration, jobID, startDate, totalPlace }: UpdateSlotInput,
  ): Promise<{ slot: Slot }> {
    const [slot, job] = await Promise.all([
      this.slotsService.findByID(Number(slotID)),
      jobID ? this.jobsService.findByID(Number(jobID)) : undefined,
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
  async job(@Parent() slot: Slot): Promise<Job> {
    if (slot.job) return slot.job;

    const job = await this.jobsService.findByID(slot.jobID);
    if (!job) throw new Error();

    return job;
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
