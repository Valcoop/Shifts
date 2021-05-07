import { Injectable } from '@nestjs/common';
import { AuthorizationCode } from 'simple-oauth2';

@Injectable()
export class AuthService {
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

  getClient() {
    return this.client;
  }
}
