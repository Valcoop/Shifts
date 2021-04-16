import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddJobInput } from '../graphql';
import { Job } from './jobs.entity';

@Injectable()
export class JobsService {
  constructor(@InjectRepository(Job) private jobRepository: Repository<Job>) {}

  save({ color, name }: AddJobInput) {
    const jobEntity = this.jobRepository.create({ name, color });
    return this.jobRepository.save(jobEntity);
  }

  async delete(jobID: string) {
    const job = await this.jobRepository.findOne(jobID);
    this.jobRepository.remove(job);

    return job;
  }
}
