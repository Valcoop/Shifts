import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { CORS_OPTION } from './constants';
import { Logger } from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // TODO: FIX ME
  app.enableCors(CORS_OPTION);
  await app.listen(3000);
  new Logger('Server').log(
    `Application is running on: ${await app.getUrl()}/graphql`,
  );
}
bootstrap();
