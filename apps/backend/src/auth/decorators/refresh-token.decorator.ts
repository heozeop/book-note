import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

/**
 * 리프레시 토큰 데코레이터.
 * Request 객체에서 리프레시 토큰을 추출합니다.
 * 쿠키나 요청 본문에서 리프레시 토큰을 찾습니다.
 */
export const RefreshToken = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | undefined => {
    // HTTP와 GraphQL 컨텍스트 모두 지원
    const ctx = GqlExecutionContext.create(context);
    // GraphQL이면 ctx.getContext().req 반환, HTTP면 context.switchToHttp().getRequest() 반환
    const request = ctx.getContext()?.req || context.switchToHttp().getRequest();

    // Try to get token from cookies first
    if (request.cookies?.refreshToken) {
      return request.cookies.refreshToken;
    }
    
    // Try from request body
    if (request.body?.refreshToken) {
      return request.body.refreshToken;
    }

    // Try from cookie header
    if (request.headers?.cookie) {
      const cookies = request.headers.cookie.split(';');
      const refreshTokenCookie = cookies.find((cookie: string) => cookie.trim().startsWith('refreshToken='));
      if (refreshTokenCookie) {
        return refreshTokenCookie.trim().substring('refreshToken='.length);
      }
    }
    
    // Return undefined if no token found
    return undefined;
  },
); 