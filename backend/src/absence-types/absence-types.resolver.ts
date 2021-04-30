import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AbsenceTypesInput,
  AddAbsenceTypeInput,
  UpdateAbsenceTypeInput,
} from '../graphql';
import { AbsenceTypeConnection } from '../graphql-types';
import { AbsenceType } from './absence-types.entity';
import { AbsenceTypesService } from './absence-types.service';

@Resolver()
export class AbsenceTypesResolver {
  constructor(private absenceTypesService: AbsenceTypesService) {}

  @Query()
  async absenceTypes(
    @Args('input') input?: AbsenceTypesInput,
  ): Promise<AbsenceTypeConnection> {
    const [totalCount, { data: absenceTypes, cursor }] = await Promise.all([
      this.absenceTypesService.count(),
      this.absenceTypesService.find(input),
    ]);

    return {
      totalCount,
      edges: absenceTypes.map((absenceType) => ({
        // TODO: base64 me
        cursor: absenceType.id.toString(),
        node: absenceType,
      })),
      pageInfo: {
        hasNextPage: Boolean(cursor.afterCursor),
        endCursor: cursor.afterCursor ?? undefined,
      },
    };
  }

  @Mutation()
  async addAbsenceType(
    @Args('input') input: AddAbsenceTypeInput,
  ): Promise<{ absenceType: AbsenceType }> {
    return { absenceType: await this.absenceTypesService.save(input.reason) };
  }

  @Mutation()
  async updateAbsenceType(
    @Args('input') { absenceTypeID, reason }: UpdateAbsenceTypeInput,
  ): Promise<{ absenceType: AbsenceType }> {
    return {
      absenceType: await this.absenceTypesService.update(
        Number(absenceTypeID),
        { ...(reason != null ? { reason } : {}) },
      ),
    };
  }
}
