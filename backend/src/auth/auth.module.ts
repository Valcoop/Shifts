import { Global, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [UsersModule],
  exports: [AuthService],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
