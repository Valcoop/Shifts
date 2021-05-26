import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import parser from 'fast-xml-parser';
import fetch from 'node-fetch';
import { NextcloudUser } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import {
  COOKIE_ACCESS_TOKEN_NAME,
  COOKIE_USER_ID_NAME,
  NC_USER_PROVISIONING_URL,
} from '../constants';
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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res } = GqlExecutionContext.create(context).getContext() as {
      req: Request & { user?: User };
      res: Response;
    };
    if (!req.user) return false;

    const accessToken = req.cookies[COOKIE_ACCESS_TOKEN_NAME];
    const token = await this.getToken(accessToken, req.user);
    // TODO: FIX ME
    if (!token) {
      res.clearCookie(COOKIE_USER_ID_NAME);
      res.clearCookie(COOKIE_ACCESS_TOKEN_NAME);
      return false;
    }

    const data = await fetch(
      `${process.env.OAUTH_HOST}${NC_USER_PROVISIONING_URL}/${req.user.externalID}`,
      { headers: { Authorization: 'Bearer ' + token.access_token } },
    );

    const {
      ocs: {
        data: externalUser,
        meta: { status },
      },
    } = parser.parse(await data.text()) as NextcloudUser;
    // TODO: FIX ME
    if (status !== 'ok') {
      res.clearCookie(COOKIE_USER_ID_NAME);
      res.clearCookie(COOKIE_ACCESS_TOKEN_NAME);
      return false;
    }
    if (!externalUser) {
      res.clearCookie(COOKIE_USER_ID_NAME);
      res.clearCookie(COOKIE_ACCESS_TOKEN_NAME);
      return false;
    }
    if (externalUser.id !== req.user.externalID) {
      res.clearCookie(COOKIE_USER_ID_NAME);
      res.clearCookie(COOKIE_ACCESS_TOKEN_NAME);
      return false;
    }

    req.user = await this.authService.syncNextcloud(req.user, {
      ...externalUser,
      token: JSON.stringify(token),
    });

    if (accessToken !== token.access_token) {
      this.authService.setCookie(
        COOKIE_ACCESS_TOKEN_NAME,
        token.access_token,
        res,
      );
    }

    return true;
  }
}
