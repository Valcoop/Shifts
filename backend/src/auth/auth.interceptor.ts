import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import parser from 'fast-xml-parser';
import fetch from 'node-fetch';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { NextcloudUser } from './auth.controller';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  private async getToken(accessToken: string | undefined, user: User) {
    if (!accessToken || !user.token) return undefined;

    const token = this.authService
      .getClient()
      .createToken(JSON.parse(user.token));
    if (!token.expired()) return token.token;

    try {
      return (await token.refresh()).token;
    } catch (error) {
      // TODO: FIX ME
      console.log('Error refreshing access token: ', error.message);
      return undefined;
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    const { req } = GqlExecutionContext.create(context).getContext() as {
      req: Request & { user?: User };
    };
    if (!req.user) throw new Error();

    const token = await this.getToken(
      req.header('Authorization')?.split('Bearer ')[1],
      req.user,
    );
    // TODO: FIX ME
    if (!token) throw new Error();

    const data = await fetch(
      'http://localhost:8080/ocs/v1.php/cloud/users/' + req.user.externalID,
      { headers: { Authorization: 'Bearer ' + token.access_token } },
    );

    // TODO: handle no user
    const {
      ocs: {
        data: externalUser,
        meta: { status },
      },
    } = parser.parse(await data.text()) as NextcloudUser;
    // TODO: handle error
    if (status !== 'ok') throw new Error();
    if (!externalUser) throw new Error();

    req.user = await this.usersService.syncNextcloud(req.user, {
      ...externalUser,
      token: JSON.stringify(token),
    });

    return next.handle();
  }
}
