import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenceType } from './absence-types.entity';
import { AbsenceTypesResolver } from './absence-types.resolver';
import { AbsenceTypesService } from './absence-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([AbsenceType])],
  providers: [AbsenceTypesResolver, AbsenceTypesService],
})
export class AbsenceTypesModule {}
