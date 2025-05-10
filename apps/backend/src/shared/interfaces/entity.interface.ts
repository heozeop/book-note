/**
 * Base interface for all domain entities
 */
export interface IEntity<T> {
  /**
   * Unique identifier for the entity
   */
  id: T;
  
  /**
   * Check if this entity equals another entity
   * @param entity Entity to compare with
   */
  equals(entity: IEntity<T>): boolean;
} 