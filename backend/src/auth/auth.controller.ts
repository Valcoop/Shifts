import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import parser from 'fast-xml-parser';
import fetch from 'node-fetch';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

export interface NextcloudUser {
  ocs: {
    data: {
      id: string;
      displayname: string;
      phone?: string;
      groups: { element: string }[];
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
        'http://localhost:8080/ocs/v1.php/cloud/users/' + externalID,
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
      if (!externalUser) return false;

      const user = await this.usersService.findOne({ where: { externalID } });

      await this.usersService.create({
        ...user,
        externalID,
        fullName: externalUser.displayname,
        phoneNumber: externalUser.phone || undefined,
        // TODO: Use correct data
        isAdmin: false,
        token: JSON.stringify(token),
      });

      // TODO: FIX ME
      return res.send('Logged in');
    } catch (error) {
      // TODO: FIX ME
      console.error('Access Token Error', error.message);
      return res.status(500).json('Authentication failed');
    }
  }
}
