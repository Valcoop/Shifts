import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AddJobInput,
  JobsInput,
  RemoveJobInput,
  UpdateJobInput,
} from '../graphql';
import { JobConnection } from '../graphql-types';
import { Job } from './jobs.entity';
import { JobsService } from './jobs.service';

@Resolver()
export class JobsResolver {
  constructor(private jobService: JobsService) {}

  @Query()
  async jobs(@Args('input') input?: JobsInput): Promise<JobConnection> {
    const [totalCount, { data: jobs, cursor }] = await Promise.all([
      this.jobService.count(),
      this.jobService.find(input),
    ]);

    return {
      totalCount,
      edges: jobs.map((job) => ({
        cursor: `id:${btoa(job.id.toString())}}`,
        node: job,
      })),
      pageInfo: {
        hasNextPage: Boolean(cursor.afterCursor),
        endCursor: cursor.afterCursor ?? undefined,
      },
    };
  }

  @Mutation()
  async addJob(@Args('input') input: AddJobInput): Promise<{ job: Job }> {
    return { job: await this.jobService.save(input) };
  }

  @Mutation()
  async removeJob(@Args('input') input: RemoveJobInput): Promise<{ job: Job }> {
    return { job: await this.jobService.delete(input.jobID) };
  }

  @Mutation()
  async updateJob(
    @Args('input') { jobID, color, name }: UpdateJobInput,
  ): Promise<{ job: Job }> {
    return {
      job: await this.jobService.update(Number(jobID), {
        ...(color != null ? { color } : {}),
        ...(name != null ? { name } : {}),
      }),
    };
  }
}
