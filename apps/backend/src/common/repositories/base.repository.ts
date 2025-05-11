import { AnyEntity } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql';

export abstract class BaseRepository<T extends AnyEntity<T>> extends EntityRepository<T> {
  /**
   * 엔티티를 영속화하고 변경사항을 저장합니다.
   * @param entity 저장할 엔티티
   */
  async persistAndFlush(entity: T): Promise<void> {
    this.getEntityManager().persist(entity);
    await this.getEntityManager().flush();
  }
  
  /**
   * 변경사항을 저장합니다.
   */
  async flush(): Promise<void> {
    await this.getEntityManager().flush();
  }
} 