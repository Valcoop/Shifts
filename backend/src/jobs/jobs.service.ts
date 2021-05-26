import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { Job } from './jobs.entity';

interface JobDAO {
  name: string;
  color: string;
  isDeleted: boolean;
}

@Injectable()
export class JobsService {
  constructor(@InjectRepository(Job) private jobRepository: Repository<Job>) {}

  count(): Promise<number> {
    return this.jobRepository.count({ isDeleted: false });
  }

  delete(job: Job) {
    return this.jobRepository.save({ ...job, isDeleted: true });
  }

  find(pagination?: { first?: number; after?: string }) {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .where('job.isDeleted = false');

    const nextPaginator = buildPaginator({
      entity: Job,
      alias: 'job',
      paginationKeys: ['id'],
      query: {
        limit: pagination?.first || 10,
        order: 'ASC',
        afterCursor: pagination?.after,
      },
    });

    return nextPaginator.paginate(queryBuilder);
  }

  findByID(id: number): Promise<Job | undefined> {
    return this.jobRepository.findOne(id);
  }

  save(jobDAO: JobDAO): Promise<Job> {
    return this.jobRepository.save(this.jobRepository.create(jobDAO));
  }

  update(job: Job, jobDAO: Partial<JobDAO>): Promise<Job> {
    return this.jobRepository.save(
      this.jobRepository.create({ ...job, ...jobDAO }),
    );
  }
}
