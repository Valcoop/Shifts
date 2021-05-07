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
import { NextcloudUser } from './auth.controller';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private authService: AuthService) {}

  private async getAccessToken(accessToken: string | undefined, user: User) {
    if (!accessToken || !user.token) return undefined;

    const token = this.authService
      .getClient()
      .createToken(JSON.parse(user.token));
    if (!token.expired()) return accessToken;

    try {
      // TODO: does not work
      return (await token.refresh()).token.access_token as string;
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

    const accessToken = await this.getAccessToken(
      req.header('Authorization')?.split('Bearer ')[1],
      req.user,
    );
    if (!accessToken) throw new Error();

    const data = await fetch(
      'http://localhost:8080/ocs/v1.php/cloud/users/' + req.user.externalID,
      { headers: { Authorization: 'Bearer ' + accessToken } },
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

    // TODO: update user

    return next.handle();
  }
}
