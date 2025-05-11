import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * HTTP 요청에서 JWT 토큰을 검증합니다.
   * @param context 실행 컨텍스트
   * @returns 검증 결과
   */
  canActivate(context: ExecutionContext) {
    // JWT 전략의 validate 메소드 호출
    return super.canActivate(context);
  }

  /**
   * 인증 실패 처리를 수행합니다.
   * @param err 에러 객체
   */
  handleRequest(err: any, user: any) {
    // 에러가 있거나 사용자가 없으면 예외 발생
    if (err || !user) {
      throw err || new UnauthorizedException('인증이 필요합니다.');
    }
    return user;
  }

  /**
   * GraphQL 컨텍스트에서 요청 객체를 가져옵니다.
   * @param context 실행 컨텍스트
   * @returns 요청 객체
   */
  getRequest(context: ExecutionContext) {
    // HTTP와 GraphQL 컨텍스트 모두 지원
    const ctx = GqlExecutionContext.create(context);
    // GraphQL이면 ctx.getContext().req 반환, HTTP면 context.switchToHttp().getRequest() 반환
    return ctx.getContext()?.req || context.switchToHttp().getRequest();
  }
} 