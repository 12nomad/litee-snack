import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AtGuard extends AuthGuard('access-jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    // request.body = ctx.getArgs().loginInput;
    return request;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<`${Role}`>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (roles && roles.includes('PUBLIC')) return true;

    const isActive = (await super.canActivate(context)) as boolean;

    if (isActive) {
      const ctx = GqlExecutionContext.create(context).getContext();
      const user = ctx.req.user;

      if (user) return true;

      if (user && !roles) return true;

      return roles.includes(user.role);
    }

    return false;
  }
}
