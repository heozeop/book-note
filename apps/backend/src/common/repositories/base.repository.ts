import { AnyEntity, EntityManager, EntityRepository } from "@mikro-orm/core";

export abstract class BaseRepository<
  T extends AnyEntity<T>,
> extends EntityRepository<T> {
  constructor(
    protected readonly em: EntityManager,
    entityName: string,
  ) {
    super(em, entityName);
  }

  /**
   * 엔티티를 영속화하고 변경사항을 저장합니다.
   * @param entity 저장할 엔티티
   */
  async persistAndFlush(entity: T): Promise<void> {
    this.em.persist(entity);
    await this.em.flush();
  }

  /**
   * 변경사항을 저장합니다.
   */
  async flush(): Promise<void> {
    await this.em.flush();
  }
}
