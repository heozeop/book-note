import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor for logging requests and responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  
  /**
   * Intercept the request/response
   * @param context Execution context
   * @param next Next handler
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = this.getRequest(context);
    const method = req.method;
    const url = req.url;
    const user = req.user?.id || 'anonymous';
    
    return next
      .handle()
      .pipe(
        tap(() => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `${method} ${url} - ${responseTime}ms - User: ${user}`,
          );
        }),
      );
  }
  
  /**
   * Get request from HTTP or GraphQL context
   * @param context Execution context
   */
  private getRequest(context: ExecutionContext): any {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }
    
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
} 