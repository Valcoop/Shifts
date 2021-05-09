import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import parser from 'fast-xml-parser';
import fetch from 'node-fetch';
import { NextcloudUser } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { User } from '../users/users.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  private async getToken(accessToken: string | undefined, user: User) {
    if (!accessToken || !user.token) return undefined;

    const userToken = JSON.parse(user.token);
    if (userToken.access_token !== accessToken) return undefined;

    const token = this.authService.getClient().createToken(userToken);
    if (!token.expired()) return token.token;

    try {
      return (await token.refresh()).token;
    } catch (error) {
      // TODO: FIX ME
      console.log('Error refreshing access token: ', error.message);
      return undefined;
    }
  }

  // TODO: HANDLE COOKIES
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = GqlExecutionContext.create(context).getContext() as {
      req: Request & { user?: User };
    };
    if (!req.user) return false;

    const token = await this.getToken(
      req.header('Authorization')?.split('Bearer ')[1],
      req.user,
    );
    // TODO: FIX ME
    if (!token) return false;

    const data = await fetch(
      'http://localhost:8080/ocs/v1.php/cloud/users/' + req.user.externalID,
      { headers: { Authorization: 'Bearer ' + token.access_token } },
    );

    const {
      ocs: {
        data: externalUser,
        meta: { status },
      },
    } = parser.parse(await data.text()) as NextcloudUser;
    // TODO: FIX ME
    if (status !== 'ok') return false;
    if (!externalUser) return false;
    if (externalUser.id !== req.user.externalID) return false;

    req.user = await this.authService.syncNextcloud(req.user, {
      ...externalUser,
      token: JSON.stringify(token),
    });

    return true;
  }
}
