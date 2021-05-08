import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { User } from '../users/users.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    // TODO: Currently, only admin role is handle with thhe isAdmin field in user entity
    if (roles.length !== 1 && roles[0] !== 'admin') throw new Error();

    const { req } = GqlExecutionContext.create(context).getContext() as {
      req: Request & { user?: User };
    };
    return Boolean(req.user?.isAdmin);
  }
}
