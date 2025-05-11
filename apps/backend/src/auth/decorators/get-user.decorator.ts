import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

/**
 * 요청 객체에서 인증된 사용자를 추출하는 데코레이터
 * @example
 * ```typescript
 * @Get()
 * findAll(@GetUser() user: User) {
 *   // user 객체를 사용하는 로직
 * }
 * ```
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    // HTTP 컨텍스트인지 GraphQL 컨텍스트인지 확인
    const isGraphQL = context.getType().toString() !== "http";

    let request: any;

    if (isGraphQL) {
      // GraphQL 컨텍스트에서 요청 객체 추출
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      // HTTP 컨텍스트에서 요청 객체 추출
      request = context.switchToHttp().getRequest();
    }

    // 요청 객체에서 user 추출
    const user = request.user;

    // data가 지정되면 해당 속성만 반환, 그렇지 않으면 전체 user 객체 반환
    return data ? user?.[data] : user;
  },
);
