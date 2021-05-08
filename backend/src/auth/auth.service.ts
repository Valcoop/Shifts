import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorizationCode } from 'simple-oauth2';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { UserDAO } from '../users/users.service';
import { NextcloudUser } from './auth.controller';

@Injectable()
export class AuthService {
  private client: AuthorizationCode;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
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

  syncNextcloud(
    user: User,
    externalUser: NextcloudUser['ocs']['data'] & { token: string },
  ): Promise<User> | User {
    const toUpdateFields: Partial<UserDAO> = {};

    if (externalUser.displayname !== user.fullName) {
      toUpdateFields.fullName = externalUser.displayname;
    }
    if (externalUser.id !== user.externalID) {
      toUpdateFields.externalID = externalUser.id;
    }
    if (externalUser.phone !== user.phoneNumber) {
      toUpdateFields.phoneNumber = externalUser.phone;
    }
    if (externalUser.token !== user.token) {
      toUpdateFields.token = externalUser.token;
    }
    //TODO: handle isAdmin

    return Object.keys(toUpdateFields).length
      ? this.userRepository.save(
          this.userRepository.create({ ...user, ...toUpdateFields }),
        )
      : user;
  }
}
