import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * GraphQL 컨텍스트에서 인증된 사용자를 추출하는 데코레이터
 * @example
 * ```typescript
 * @Query(() => [Book])
 * findBooks(@CurrentUser() user: User) {
 *   // user 객체를 사용하는 로직
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    return data ? user?.[data] : user;
  },
); 