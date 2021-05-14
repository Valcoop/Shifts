import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import parser from 'fast-xml-parser';
import fetch from 'node-fetch';
import {
  COOKIE_ACCESS_TOKEN_NAME,
  COOKIE_USER_ID_NAME,
  PLANNING_GROUP_NAME,
} from '../constants';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

export interface NextcloudUser {
  ocs: {
    data: {
      id: string;
      displayname: string;
      phone?: string;
      groups: { element: string | string[] };
    };
    meta: { status: string };
  };
}

@Controller('auth')
export class AuthController {
  private readonly CALLBACK_URL = 'http://localhost:3000/auth/redirect';

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('/login')
  login(@Res() res: Response) {
    return res.redirect(
      this.authService
        .getClient()
        .authorizeURL({ redirect_uri: this.CALLBACK_URL }),
    );
  }

  @Get('redirect')
  async redirect(@Query() req: { code?: string }, @Res() res: Response) {
    try {
      // TODO: FIX ME
      if (!req.code) throw new Error();

      const token = await this.authService.getClient().getToken({
        code: req.code,
        redirect_uri: this.CALLBACK_URL,
      });

      const externalID = token.token.user_id;
      const data = await fetch(
        `${process.env.OAUTH_HOST}/ocs/v1.php/cloud/users/${externalID}`,
        { headers: { Authorization: 'Bearer ' + token.token.access_token } },
      );

      const {
        ocs: {
          data: externalUser,
          meta: { status },
        },
      } = parser.parse(await data.text()) as NextcloudUser;
      // TODO: FIX ME
      if (status !== 'ok') throw new Error();
      // TODO: FIX ME
      if (!externalUser) throw new Error();

      const user = await this.usersService.findOne({ where: { externalID } });
      if (!user) {
        const newUser = await this.usersService.create({
          externalID,
          fullName: externalUser.displayname,
          phoneNumber: externalUser.phone || undefined,
          isAdmin: [...externalUser.groups.element].includes(
            PLANNING_GROUP_NAME,
          ),
          token: JSON.stringify(token),
        });

        this.authService.setCookie(
          COOKIE_USER_ID_NAME,
          newUser.id.toString(),
          res,
        );
      } else {
        await this.authService.syncNextcloud(user, {
          ...externalUser,
          token: JSON.stringify(token),
        });

        this.authService.setCookie(
          COOKIE_USER_ID_NAME,
          user.id.toString(),
          res,
        );
      }

      this.authService.setCookie(
        COOKIE_ACCESS_TOKEN_NAME,
        token.token.access_token,
        res,
      );

      // TODO: FIX ME
      return res.send('Logged in');
    } catch (error) {
      // TODO: FIX ME
      console.error('Access Token Error', error.message);
      return res.status(500).json('Authentication failed');
    }
  }
}
