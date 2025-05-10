import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DomainExceptionFilter } from './filters/domain-exception.filter';
import { GraphQLExceptionFilter } from './filters/graphql-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

/**
 * Shared module with common components
 */
@Global()
@Module({
  providers: [
    // Global exception filters
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GraphQLExceptionFilter,
    },
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [],
})
export class SharedModule {} 