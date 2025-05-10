import { IEntity } from './entity.interface';

/**
 * Interface for all repositories
 */
export interface IRepository<T extends IEntity<ID>, ID> {
  /**
   * Find an entity by its ID
   * @param id Entity ID
   */
  findById(id: ID): Promise<T | null>;
  
  /**
   * Find all entities
   */
  findAll(): Promise<T[]>;
  
  /**
   * Save an entity
   * @param entity Entity to save
   */
  save(entity: T): Promise<T>;
  
  /**
   * Delete an entity
   * @param entity Entity to delete
   */
  delete(entity: T): Promise<void>;
  
  /**
   * Delete an entity by its ID
   * @param id Entity ID
   */
  deleteById(id: ID): Promise<void>;
  
  /**
   * Check if an entity exists by its ID
   * @param id Entity ID
   */
  exists(id: ID): Promise<boolean>;
} 