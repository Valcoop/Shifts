import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Job } from './jobs.entity';

interface JobDAO {
  name: string;
  color: string;
}

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

  findByID(id: number) {
    return this.jobRepository.findOne({ where: { id } });
  }

  save(jobDAO: JobDAO) {
    return this.jobRepository.save(this.jobRepository.create(jobDAO));
  }

  async delete(jobID: string) {
    const job = await this.jobRepository.findOne(jobID);
    // TODO: FIX ME
    if (!job) throw new Error();

    this.jobRepository.remove(job);

    return job;
  }

  update(jobID: number, jobDAO: Partial<JobDAO>) {
    return this.jobRepository.save(
      this.jobRepository.create({ id: jobID, ...jobDAO }),
    );
  }
}
