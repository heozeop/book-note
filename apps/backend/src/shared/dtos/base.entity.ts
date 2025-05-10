import { PrimaryKey, Property } from '@mikro-orm/core';
import { IEntity } from '../interfaces/entity.interface';

/**
 * Base entity class with common properties and methods
 */
export abstract class BaseEntity<T> implements IEntity<T> {
  @PrimaryKey()
  id!: T;
  
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
  
  @Property({ 
    type: 'datetime', 
    defaultRaw: 'CURRENT_TIMESTAMP', 
    onUpdate: () => new Date() 
  })
  updatedAt: Date = new Date();
  
  /**
   * Check if this entity equals another entity
   * @param entity Entity to compare with
   */
  public equals(entity: IEntity<T>): boolean {
    if (entity === this) {
      return true;
    }
    
    if (!(entity instanceof BaseEntity)) {
      return false;
    }
    
    return this.id === entity.id;
  }
} 