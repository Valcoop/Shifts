import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';
import { Response } from 'express';
import parser from 'fast-xml-parser';
import fetch from 'node-fetch';
import { AuthorizationCode } from 'simple-oauth2';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  private readonly CALLBACK_URL = 'http://localhost:3000/auth/redirect';
  private client: AuthorizationCode<'client_id'>;

  constructor(private usersService: UsersService) {
    this.client = new AuthorizationCode({
      client: {
        id: '8aSPndK3XtZsPbbfOugInfpi6FDZI1K6QsFBG6vbLKEZKdzfDbcubMQtL3R9Rh28',
        secret:
          'nSnFd5kNIaJpcgvwe4HtiYRKijhl93SeNiPvYyNhpvytdoOZimLKTwXqQNuZqE9Q',
      },
      auth: {
        tokenHost: 'http://localhost:8080',
        tokenPath: '/apps/oauth2/api/v1/token',
        authorizePath: '/apps/oauth2/authorize',
      },
      options: { authorizationMethod: 'body' },
    });
  }

  @Get('/login')
  @Redirect('https://nestjs.com', 301)
  login(): { url: string } {
    return {
      url: this.client.authorizeURL({ redirect_uri: this.CALLBACK_URL }),
    };
  }

  @Get('redirect')
  async redirect(@Query() req: { code?: string }, @Res() res: Response) {
    try {
      // TODO: FIX ME
      if (!req.code) throw new Error();
      const { token } = await this.client.getToken({
        code: req.code,
        redirect_uri: this.CALLBACK_URL,
      });

      const externalID = token.user_id;
      const user = await this.usersService.findOne({ where: { externalID } });
      if (!user) {
        const data = await fetch(
          'http://localhost:8080/ocs/v1.php/cloud/users/' + externalID,
          { headers: { Authorization: 'Bearer ' + token.access_token } },
        );

        const {
          ocs: { data: externalUser },
        } = parser.parse(await data.text()) as {
          ocs: {
            data: {
              id: string;
              displayname: string;
              phone: string;
              groups: { element: string }[];
            };
          };
        };

        // TODO: Use correct data
        await this.usersService.create({
          externalID,
          firstname: '',
          lastname: '',
          phoneNumber: externalUser.phone,
          isAdmin: false,
        });
      }

      return res.send('Logged in');
    } catch (error) {
      console.error('Access Token Error', error.message);
      return res.status(500).json('Authentication failed');
    }
  }
}
