import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { User } from '../users/users.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // TODO: il faut check l'accessToken. Sinon pas très sécure, juste a envoyé l'id du user en header
    const { req } = GqlExecutionContext.create(context).getContext() as {
      req: Request & { user?: User };
    };
    return req.user ? true : false;
  }
}
