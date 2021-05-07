import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthenticatedContext } from './auth/auth.guard';
import { UsersService } from './users/users.service';

@Injectable()
export default class LoginMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(
    req: AuthenticatedContext['req'],
    __: Response,
    next: NextFunction,
  ) {
    const userID = req.header('X-user-id');
    const user = userID
      ? await this.usersService.findOne({ where: { externalID: userID } })
      : undefined;

    req.user = user;

    next();
  }
}
