import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '../decorator/roles.decorator';
import {
  AddJobInput,
  JobsInput,
  RemoveJobInput,
  UpdateJobInput,
} from '../graphql';
import { JobConnection } from '../graphql-types';
import { AuthGuard } from '../guards/auth.guard';
import { TokenInterceptor } from '../interceptors/token.interceptor';
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
  @UseInterceptors(TokenInterceptor)
  async addJob(
    @Args('input') { color, name }: AddJobInput,
  ): Promise<{ job: Job }> {
    return {
      job: await this.jobsService.save({ color, name, isDeleted: false }),
    };
  }

  @Mutation()
  @UseInterceptors(TokenInterceptor)
  async removeJob(
    @Args('input') { jobID }: RemoveJobInput,
  ): Promise<{ job: Job }> {
    const job = await this.jobsService.findByID(Number(jobID));
    // TODO: FIX ME
    if (!job) throw new Error();

    return { job: await this.jobsService.delete(job) };
  }

  @Mutation()
  @UseInterceptors(TokenInterceptor)
  async updateJob(
    @Args('input') { jobID, color, name }: UpdateJobInput,
  ): Promise<{ job: Job }> {
    const job = await this.jobsService.findByID(Number(jobID));
    // TODO: FIX ME
    if (!job) throw new Error();

    return {
      job: await this.jobsService.update(job, {
        ...(color != null ? { color } : {}),
        ...(name != null ? { name } : {}),
      }),
    };
  }
}
