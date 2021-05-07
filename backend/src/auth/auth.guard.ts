import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import parser from 'fast-xml-parser';
import fetch from 'node-fetch';
import { User } from '../users/users.entity';
import { NextcloudUser } from './auth.controller';
import { Request } from 'express';

export interface AuthenticatedContext {
  req: Request & { user?: User };
}

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = GqlExecutionContext.create(
      context,
    ).getContext() as AuthenticatedContext;

    const accessToken =
      req.header('Authorization') &&
      (req.header('Authorization') as string).split('Bearer ')[1];
    if (!accessToken || !req.user) return false;

    const data = await fetch(
      'http://localhost:8080/ocs/v1.php/cloud/users/' + req.user.id,
      { headers: { Authorization: 'Bearer ' + accessToken } },
    );

    // TODO: handle no user
    const {
      ocs: { data: externalUser },
    } = parser.parse(await data.text()) as NextcloudUser;
    if (!externalUser) return false;

    return true;
  }
}
