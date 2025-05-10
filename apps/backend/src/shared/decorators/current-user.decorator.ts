import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorator to get the current authenticated user
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest().user;
    }
    
    // Handle GraphQL context
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
); 