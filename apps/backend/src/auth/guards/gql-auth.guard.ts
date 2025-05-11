import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class GqlAuthGuard extends JwtAuthGuard {
  /**
   * GraphQL 컨텍스트에서 요청 객체를 가져옵니다.
   * @param context 실행 컨텍스트
   * @returns 요청 객체
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
} 