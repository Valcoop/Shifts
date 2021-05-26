import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { CtxLogger } from '../decorator/logger.decorator';
import { Roles } from '../decorator/roles.decorator';
import {
  AddJobInput,
  JobsInput,
  RemoveJobInput,
  UpdateJobInput,
} from '../graphql';
import { JobConnection } from '../graphql-types';
import { AuthGuard } from '../guards/auth.guard';
import { Logger } from '../logger';
import { btoa } from '../utils';
import { Job } from './jobs.entity';
import { JobsService } from './jobs.service';

@Resolver()
@UseGuards(AuthGuard)
@Roles('admin')
export class JobsResolver {
  constructor(private jobsService: JobsService) {}

  @Query()
  async jobs(@Args('input') input?: JobsInput): Promise<JobConnection> {
    const [totalCount, { data: jobs, cursor }] = await Promise.all([
      this.jobsService.count(),
      this.jobsService.find(input),
    ]);

    return {
      totalCount,
      edges: jobs.map((job) => ({
        cursor: btoa(`id:${job.id.toString()}`),
        node: job,
      })),
      pageInfo: {
        hasNextPage: Boolean(cursor.afterCursor),
        endCursor: cursor.afterCursor ?? undefined,
      },
    };
  }

  @Mutation()
  async addJob(
    @Args('input') { color, name }: AddJobInput,
  ): Promise<{ job: Job }> {
    return {
      job: await this.jobsService.save({ color, name, isDeleted: false }),
    };
  }

  @Mutation()
  async removeJob(
    @Args('input') { jobID }: RemoveJobInput,
    @CtxLogger() logger: Logger,
  ): Promise<{ job: Job }> {
    const job = await this.jobsService.findByID(Number(jobID));
    if (!job) {
      logger.warn('No such job', JobsResolver.name, { jobID });
      throw new ApolloError('No such job', 'INVALID_ID');
    }

    return { job: await this.jobsService.delete(job) };
  }

  @Mutation()
  async updateJob(
    @Args('input') { jobID, color, name }: UpdateJobInput,
    @CtxLogger() logger: Logger,
  ): Promise<{ job: Job }> {
    const job = await this.jobsService.findByID(Number(jobID));
    if (!job) {
      logger.warn('No such job', JobsResolver.name, { jobID });
      throw new ApolloError('No such job', 'INVALID_ID');
    }

    return {
      job: await this.jobsService.update(job, {
        ...(color != null ? { color } : {}),
        ...(name != null ? { name } : {}),
      }),
    };
  }
}
