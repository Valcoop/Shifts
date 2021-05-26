import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { CtxLogger } from '../decorator/logger.decorator';
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
import { Logger } from '../logger';
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
    @CtxLogger() logger: Logger,
  ): Promise<{ userSlot: UserSlot }> {
    const slot = await this.slotsService.findByID(Number(slotID));
    if (!slot) {
      logger.warn('No such slot', SlotsResolver.name, { slotID });
      throw new ApolloError('No such slot', 'INVALID_ID');
    }
    // TODO: FIX ME
    if (!slot.active || slot.isDeleted) throw new Error();

    const userSlotCount = await this.slotsService.countUserSlots(slot.id);
    if (userSlotCount >= slot.totalPlace) {
      logger.warn('Slot is full', SlotsResolver.name, { slotID });
      throw new Error();
    }

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
    @CtxLogger() logger: Logger,
  ): Promise<{ userSlot: UserSlot }> {
    const userSlot = await this.userSlotsService.findByID(Number(userSlotID));
    if (!userSlot) {
      logger.warn('No such userSlot', SlotsResolver.name, { userSlotID });
      throw new ApolloError('No such userSlot', 'INVALID_ID');
    }
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
    @CurrentUser() user: User,
    @Args('input')
    { active, duration, jobID, startDate, totalPlace }: AddSlotInput,
    @CtxLogger() logger: Logger,
  ): Promise<{ slot: Slot }> {
    const job = await this.jobsService.findByID(Number(jobID));
    if (!job) {
      logger.warn('No such job', SlotsResolver.name, { jobID });
      throw new ApolloError('No such job', 'INVALID_ID');
    }

    return {
      slot: await this.slotsService.save({
        active,
        userAdminCreated: user.id,
        lastUserAdminUpdated: user.id,
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
    @CtxLogger() logger: Logger,
  ): Promise<{ slot: Slot }> {
    const slot = await this.slotsService.findByID(Number(slotID));
    if (!slot) {
      logger.warn('No such slot', SlotsResolver.name, { slotID });
      throw new ApolloError('No such slot', 'INVALID_ID');
    }

    const userSlotCount = await this.slotsService.countUserSlots(slot.id);
    if (userSlotCount !== 0) {
      logger.warn('Cannot delete slot with user', SlotsResolver.name, {
        slotID: slot.id,
      });
      throw new Error();
    }

    return { slot: await this.slotsService.delete(slot) };
  }

  @Mutation()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async updateSlot(
    @CurrentUser() user: User,
    @Args('input')
    { slotID, active, duration, jobID, startDate, totalPlace }: UpdateSlotInput,
    @CtxLogger() logger: Logger,
  ): Promise<{ slot: Slot }> {
    const [slot, job] = await Promise.all([
      this.slotsService.findByID(Number(slotID)),
      jobID ? this.jobsService.findByID(Number(jobID)) : undefined,
    ]);
    if (!slot) {
      logger.warn('No such slot', SlotsResolver.name, { slotID });
      throw new ApolloError('No such slot', 'INVALID_ID');
    }
    if (jobID && !job) {
      logger.warn('No such job', SlotsResolver.name, { jobID });
      throw new ApolloError('No such job', 'INVALID_ID');
    }

    return {
      slot: await this.slotsService.update(slot, {
        lastUserAdminUpdated: user.id,
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
