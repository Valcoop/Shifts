import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AddJobInput, JobsInput, RemoveJobInput } from '../graphql';
import { JobConnection } from '../graphql-types';
import { Job } from './jobs.entity';
import { JobsService } from './jobs.service';

@Resolver()
export class JobsResolver {
  constructor(private jobService: JobsService) {}

  @Query()
  async jobs(@Args('input') input?: JobsInput): Promise<JobConnection> {
    const [jobs, totalCount] = await this.jobService.find(input);

    return {
      totalCount,
      edges: jobs.map((job) => ({
        cursor: job.id.toString(),
        node: job,
      })),
      pageInfo: {
        // @TODO: fix me
        hasNextPage: false,
        endCursor: jobs[jobs.length - 1].id.toString(),
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
}
