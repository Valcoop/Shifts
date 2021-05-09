import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { AuthorizationCode } from 'simple-oauth2';
import { Repository } from 'typeorm';
import {
  OAUTH_AUTHORIZE_PATH,
  OAUTH_TOKEN_PATH,
  PLANNING_GROUP_NAME,
} from '../constants';
import { User } from '../users/users.entity';
import { UserDAO } from '../users/users.service';
import { NextcloudUser } from './auth.controller';

@Injectable()
export class AuthService {
  private client: AuthorizationCode;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    if (
      !process.env.OAUTH_HOST ||
      !process.env.OAUTH_CLIENT_ID ||
      !process.env.OAUTH_SECRET
    ) {
      throw new Error();
    }

    this.client = new AuthorizationCode({
      client: {
        id: process.env.OAUTH_CLIENT_ID,
        secret: process.env.OAUTH_SECRET,
      },
      auth: {
        tokenHost: process.env.OAUTH_HOST,
        tokenPath: OAUTH_TOKEN_PATH,
        authorizePath: OAUTH_AUTHORIZE_PATH,
      },
      options: { authorizationMethod: 'body' },
    });
  }

  getClient() {
    return this.client;
  }

  setCookie(name: string, value: string, res: Response) {
    res.cookie(name, value, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict',
    });
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
    if (
      user.isAdmin &&
      ![...externalUser.groups.element].includes(PLANNING_GROUP_NAME)
    ) {
      toUpdateFields.isAdmin = false;
    }
    if (
      !user.isAdmin &&
      [...externalUser.groups.element].includes(PLANNING_GROUP_NAME)
    ) {
      toUpdateFields.isAdmin = true;
    }

    return Object.keys(toUpdateFields).length
      ? this.userRepository.save(
          this.userRepository.create({ ...user, ...toUpdateFields }),
        )
      : user;
  }
}
