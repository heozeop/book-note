import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { IEntity } from '../interfaces/entity.interface';
import { IRepository } from '../interfaces/repository.interface';

/**
 * Base repository implementation using MikroORM
 */
export abstract class BaseRepository<T extends IEntity<ID>, ID> implements IRepository<T, ID> {
  constructor(protected readonly repository: EntityRepository<T>, protected readonly em: EntityManager) {}
  
  /**
   * Find an entity by its ID
   * @param id Entity ID
   */
  async findById(id: ID): Promise<T | null> {
    return this.repository.findOne({ id } as any);
  }
  
  /**
   * Find all entities
   */
  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }
  
  /**
   * Save an entity
   * @param entity Entity to save
   */
  async save(entity: T): Promise<T> {
    await this.repository.create(entity);
    await this.em.flush();

    return entity;
  }
  
  /**
   * Delete an entity
   * @param entity Entity to delete
   */
  async delete(entity: T): Promise<void> {
    await this.repository.nativeDelete(entity);
    await this.em.flush();
  }
  
  /**
   * Delete an entity by its ID
   * @param id Entity ID
   */
  async deleteById(id: ID): Promise<void> {
    const entity = await this.findById(id);
    if (entity) {
      await this.delete(entity);
    }
  }
  
  /**
   * Check if an entity exists by its ID
   * @param id Entity ID
   */
  async exists(id: ID): Promise<boolean> {
    const count = await this.repository.findOne({ id } as any);
    return count !== null;
  }
} 