import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './jobs.entity';
import { JobsResolver } from './jobs.resolver';
import { JobsService } from './jobs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  providers: [JobsResolver, JobsService],
})
export class JobsModule {}
