import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { AddJobInput } from '../graphql';
import { Job } from './jobs.entity';

@Injectable()
export class JobsService {
  constructor(@InjectRepository(Job) private jobRepository: Repository<Job>) {}

  find(pagination?: { first?: number; after?: string }) {
    return Promise.all([
      this.jobRepository.find({
        ...(pagination?.after && { where: { id: LessThan(pagination.after) } }),
        take: pagination?.first || 10,
      }),
      this.jobRepository.count(),
    ]);
  }

  save({ color, name }: AddJobInput) {
    const jobEntity = this.jobRepository.create({ name, color });
    return this.jobRepository.save(jobEntity);
  }

  async delete(jobID: string) {
    const job = await this.jobRepository.findOne(jobID);
    // TODO: FIX ME
    if (!job) throw new Error();

    this.jobRepository.remove(job);

    return job;
  }
}
