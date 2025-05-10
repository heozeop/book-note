import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { ValidationException } from '../exceptions/validation.exception';

/**
 * Filter to handle domain exceptions
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.BAD_REQUEST;
    
    // Map different domain exceptions to HTTP status codes
    if (exception instanceof ValidationException) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof EntityNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    }
    
    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
} 