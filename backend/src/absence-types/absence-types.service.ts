import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildPaginator } from 'typeorm-cursor-pagination';
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

  count(): Promise<number> {
    return this.absenceTypeRepository.count();
  }

  find(pagination?: { first?: number; after?: string }) {
    const queryBuilder = this.absenceTypeRepository.createQueryBuilder(
      'absence_type',
    );

    const nextPaginator = buildPaginator({
      entity: AbsenceType,
      alias: 'absence_type',
      paginationKeys: ['id'],
      query: {
        limit: pagination?.first || 10,
        order: 'ASC',
        afterCursor: pagination?.after,
      },
    });

    return nextPaginator.paginate(queryBuilder);
  }

  save(reason: string): Promise<AbsenceType> {
    return this.absenceTypeRepository.save(
      this.absenceTypeRepository.create({ reason }),
    );
  }

  update(
    absenceTypeID: number,
    absenceTypeDAO: Partial<AbsenceTypeDAO>,
  ): Promise<AbsenceType> {
    return this.absenceTypeRepository.save(
      this.absenceTypeRepository.create({
        id: absenceTypeID,
        ...absenceTypeDAO,
      }),
    );
  }
}
