import { DomainException } from './domain.exception';

/**
 * Exception thrown when an entity is not found
 */
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id?: string | number) {
    const idStr = id ? ` with ID "${id}"` : '';
    super(`${entityName}${idStr} not found`);
  }
} 