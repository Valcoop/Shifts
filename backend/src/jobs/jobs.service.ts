import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { Job } from './jobs.entity';

interface JobDAO {
  name: string;
  color: string;
}

@Injectable()
export class JobsService {
  constructor(@InjectRepository(Job) private jobRepository: Repository<Job>) {}

  count(): Promise<number> {
    return this.jobRepository.count({});
  }

  find(pagination?: { first?: number; after?: string }) {
    const queryBuilder = this.jobRepository.createQueryBuilder('job');

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
