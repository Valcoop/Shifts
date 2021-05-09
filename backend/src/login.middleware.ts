import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from './users/users.entity';
import { UsersService } from './users/users.service';

@Injectable()
export default class LoginMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request & { user?: User }, __: Response, next: NextFunction) {
    const userID = req.cookies['user_id'];
    const user = userID
      ? await this.usersService.findOne({ where: { id: userID } })
      : undefined;

    req.user = user;

    next();
  }
}
