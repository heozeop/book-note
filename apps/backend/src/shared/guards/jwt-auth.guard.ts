import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard for JWT authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  
  /**
   * Check if the route or resolver is public
   * @param context Execution context
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Skip authentication for public routes/resolvers
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }
  
  /**
   * Get request from GraphQL or HTTP context
   * @param context Execution context
   */
  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }
    
    // Handle GraphQL context
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
  
  /**
   * Handle authentication errors
   * @param err Error
   */
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
} 