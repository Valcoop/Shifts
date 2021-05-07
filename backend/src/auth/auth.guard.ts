import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import parser from 'fast-xml-parser';
import fetch from 'node-fetch';
import { NextcloudUser } from './auth.controller';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();

    const accessToken =
      ctx.req.header('Authorization') &&
      (ctx.req.header('Authorization') as string).split('Bearer ')[1];

    const userID = ctx.req.header('X-user-id');

    // TODO: Vérifque le user existe dans notre base. Ne serait il pas mieux de find le user dans notre base autre part et de le mettre dans le context

    if (!accessToken || !userID) return false;

    const data = await fetch(
      'http://localhost:8080/ocs/v1.php/cloud/users/' + userID,
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
