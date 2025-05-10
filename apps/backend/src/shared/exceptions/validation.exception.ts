import { DomainException } from './domain.exception';

/**
 * Exception thrown when validation fails
 */
export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
  
  /**
   * Create a validation exception with field name
   * @param field Name of the field
   * @param message Validation message
   */
  static fromField(field: string, message: string): ValidationException {
    return new ValidationException(`${field}: ${message}`);
  }
  
  /**
   * Create a validation exception with multiple errors
   * @param errors Validation errors
   */
  static fromErrors(errors: Record<string, string>): ValidationException {
    const formattedErrors = Object.entries(errors)
      .map(([field, error]) => `${field}: ${error}`)
      .join(', ');
    
    return new ValidationException(`Validation failed: ${formattedErrors}`);
  }
} 