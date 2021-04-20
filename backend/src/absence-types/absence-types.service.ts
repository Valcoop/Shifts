import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { AbsenceType } from './absence-types.entity';

interface AbsenceTypeDAO {
  reason: string;
}

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
    return this.absenceTypeRepository.save(
      this.absenceTypeRepository.create({ reason }),
    );
  }

  update(absenceTypeID: number, absenceTypeDAO: Partial<AbsenceTypeDAO>) {
    return this.absenceTypeRepository.save(
      this.absenceTypeRepository.create({
        id: absenceTypeID,
        ...absenceTypeDAO,
      }),
    );
  }
}
