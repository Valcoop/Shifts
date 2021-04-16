import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { AbsenceType } from './absence-types.entity';

@Injectable()
export class AbsenceTypesService {
  constructor(
    @InjectRepository(AbsenceType)
    private absenceTypeRepository: Repository<AbsenceType>,
  ) {}

  find(pagination?: { first?: number; after?: string }) {
    return Promise.all([
      this.absenceTypeRepository.find({
        ...(pagination?.after && { where: { id: LessThan(pagination.after) } }),
        take: pagination?.first || 10,
      }),
      this.absenceTypeRepository.count(),
    ]);
  }

  save(reason: string) {
    const absenceTypeEntity = this.absenceTypeRepository.create({ reason });
    return this.absenceTypeRepository.save(absenceTypeEntity);
  }
}
