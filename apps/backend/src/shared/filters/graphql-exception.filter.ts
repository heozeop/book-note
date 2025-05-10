import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { ApolloError, UserInputError } from 'apollo-server-express';
import { DomainException } from '../exceptions/domain.exception';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { ValidationException } from '../exceptions/validation.exception';

/**
 * Filter to handle GraphQL exceptions
 */
@Catch(DomainException)
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    
    // Map domain exceptions to Apollo errors
    if (exception instanceof ValidationException) {
      return new UserInputError(exception.message);
    } else if (exception instanceof EntityNotFoundException) {
      return new ApolloError(exception.message, 'NOT_FOUND');
    }
    
    // Default handling
    return new ApolloError(exception.message, 'DOMAIN_ERROR');
  }
} 