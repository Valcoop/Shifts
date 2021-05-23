import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AbsenceTypesModule } from './absence-types/absence-types.module';
import { AuthModule } from './auth/auth.module';
import { CORS_OPTION } from './constants';
import { RolesGuard } from './guards/roles.guard';
import { JobsModule } from './jobs/jobs.module';
import { Logger } from './logger';
import LoginMiddleware from './login.middleware';
import { SlotsModule } from './slots/slots.module';
import { UserSlotsModule } from './user-slots/user-slots.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AbsenceTypesModule,
    AuthModule,
    JobsModule,
    SlotsModule,
    UsersModule,
    UserSlotsModule,
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      definitions: { path: join(process.cwd(), 'src/graphql.ts') },
      // TODO: FIX ME
      cors: CORS_OPTION,
      context: ({ req, res }) => {
        req.logger = new Logger();

        if (req.user) req.logger.setData({ userID: req.user.id });

        return { req, res };
      },
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginMiddleware).forRoutes('*');
  }
}
