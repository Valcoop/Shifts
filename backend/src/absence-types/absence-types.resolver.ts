import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AbsenceTypesInput, AddAbsenceTypeInput } from '../graphql';
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
    const [absenceTypes, totalCount] = await this.absenceTypesService.find(
      input,
    );

    return {
      totalCount,
      edges: absenceTypes.map((absenceType) => ({
        cursor: absenceType.id.toString(),
        node: absenceType,
      })),
      pageInfo: {
        // @TODO: fix me
        hasNextPage: false,
        endCursor: absenceTypes[absenceTypes.length - 1]?.id.toString(),
      },
    };
  }

  @Mutation()
  async addAbsenceType(
    @Args('input') input: AddAbsenceTypeInput,
  ): Promise<{ absenceType: AbsenceType }> {
    return { absenceType: await this.absenceTypesService.save(input.reason) };
  }
}
