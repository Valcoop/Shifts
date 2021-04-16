import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AddJobInput,
  JobConnection,
  JobsInput,
  RemoveJobInput,
} from '../graphql';
import { Job } from './jobs.entity';
import { JobsService } from './jobs.service';

@Resolver()
export class JobsResolver {
  constructor(private jobService: JobsService) {}

  @Query()
  async jobs(@Args('input') input: JobsInput): Promise<JobConnection> {
    return;
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
