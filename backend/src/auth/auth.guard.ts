import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import parser from 'fast-xml-parser';
import fetch from 'node-fetch';
import { AuthorizationCode } from 'simple-oauth2';
import { User } from '../users/users.entity';
import { NextcloudUser } from './auth.controller';

// TODO: change naming
export interface AuthenticatedContext {
  req: Request & { user?: User };
}

@Injectable()
export class AuthGuard implements CanActivate {
  private client: AuthorizationCode;

  constructor() {
    this.client = new AuthorizationCode({
      client: {
        // TODO: use env var
        id: '8aSPndK3XtZsPbbfOugInfpi6FDZI1K6QsFBG6vbLKEZKdzfDbcubMQtL3R9Rh28',
        // TODO: use env var
        secret:
          'nSnFd5kNIaJpcgvwe4HtiYRKijhl93SeNiPvYyNhpvytdoOZimLKTwXqQNuZqE9Q',
      },
      auth: {
        // TODO: use env var
        tokenHost: 'http://localhost:8080',
        tokenPath: '/apps/oauth2/api/v1/token',
        authorizePath: '/apps/oauth2/authorize',
      },
      options: { authorizationMethod: 'body' },
    });
  }

  private async getAccessToken(
    req: AuthenticatedContext['req'] & { user: User },
  ) {
    const accessToken =
      req.header('Authorization') &&
      (req.header('Authorization') as string).split('Bearer ')[1];
    if (!accessToken) return undefined;

    if (!req.user.token) return undefined;

    const token = this.client.createToken(JSON.parse(req.user.token));
    if (!token.expired()) return accessToken;

    try {
      return (await token.refresh()).token.access_token as string;
    } catch (error) {
      // TODO: FIX ME
      console.log('Error refreshing access token: ', error.message);
      return undefined;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = GqlExecutionContext.create(
      context,
    ).getContext() as AuthenticatedContext;
    if (!req.user) return false;

    // @ts-ignore
    const accessToken = await this.getAccessToken(req);
    if (!accessToken) return false;

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
    if (status !== 'ok') return false;
    if (!externalUser) return false;

    return true;
  }
}
