import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AbsenceTypesModule } from './absence-types/absence-types.module';
import { JobsModule } from './jobs/jobs.module';
import { SlotsModule } from './slots/slots.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AbsenceTypesModule,
    JobsModule,
    SlotsModule,
    UsersModule,
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      definitions: { path: join(process.cwd(), 'src/graphql.ts') },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB,
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
