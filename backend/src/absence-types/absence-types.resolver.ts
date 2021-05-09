import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '../decorator/roles.decorator';
import {
  AbsenceTypesInput,
  AddAbsenceTypeInput,
  UpdateAbsenceTypeInput,
} from '../graphql';
import { AbsenceTypeConnection } from '../graphql-types';
import { AuthGuard } from '../guards/auth.guard';
import { btoa } from '../utils';
import { AbsenceType } from './absence-types.entity';
import { AbsenceTypesService } from './absence-types.service';

@Resolver()
@UseGuards(AuthGuard)
@Roles('admin')
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
        cursor: btoa(`id:${absenceType.id.toString()}`),
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
    const absenceType = await this.absenceTypesService.findByID(
      Number(absenceTypeID),
    );
    // TODO: FIX ME
    if (!absenceType) throw new Error();

    return {
      absenceType: await this.absenceTypesService.update(absenceType, {
        ...(reason != null ? { reason } : {}),
      }),
    };
  }
}
