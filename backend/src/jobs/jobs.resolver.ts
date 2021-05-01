import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AddJobInput,
  JobsInput,
  RemoveJobInput,
  UpdateJobInput,
} from '../graphql';
import { JobConnection } from '../graphql-types';
import { btoa } from '../utils';
import { Job } from './jobs.entity';
import { JobsService } from './jobs.service';

@Resolver()
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
        cursor: btoa(`id:${job.id.toString()}}`),
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
      job: await this.jobsService.save({ color, name, isDelete: false }),
    };
  }

  @Mutation()
  async removeJob(
    @Args('input') { jobID }: RemoveJobInput,
  ): Promise<{ job: Job }> {
    const job = await this.jobsService.findByID(Number(jobID));
    // TODO: FIX ME
    if (!job) throw new Error();

    return { job: await this.jobsService.delete(job) };
  }

  @Mutation()
  async updateJob(
    @Args('input') { jobID, color, name }: UpdateJobInput,
  ): Promise<{ job: Job }> {
    return {
      job: await this.jobsService.update(Number(jobID), {
        ...(color != null ? { color } : {}),
        ...(name != null ? { name } : {}),
      }),
    };
  }
}
