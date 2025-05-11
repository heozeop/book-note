import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { Collection } from "../entities/collection.entity";

@Injectable()
export class CollectionRepository extends BaseRepository<Collection> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Collection");
  }

  /**
   * 사용자 ID로 컬렉션을 찾습니다.
   * @param ownerId 소유자 ID
   * @returns 컬렉션 목록
   */
  async findByOwnerId(ownerId: string): Promise<Collection[]> {
    return this.find({ owner: ownerId });
  }

  /**
   * 컬렉션 ID와 소유자 ID로 컬렉션을 찾습니다.
   * @param id 컬렉션 ID
   * @param ownerId 소유자 ID
   * @returns 컬렉션 또는 null
   */
  async findByIdAndOwnerId(id: string, ownerId: string): Promise<Collection | null> {
    return this.findOne({ id, owner: ownerId });
  }

  /**
   * 기본 컬렉션을 찾습니다.
   * @param ownerId 소유자 ID
   * @returns 기본 컬렉션 또는 null
   */
  async findDefaultCollection(ownerId: string): Promise<Collection | null> {
    return this.findOne({ owner: ownerId, isDefault: true });
  }

  /**
   * 컬렉션을 업데이트합니다.
   * @param id 컬렉션 ID
   * @param data 업데이트할 데이터
   * @returns 영향 받은 행 수
   */
  async updateCollection(id: string, data: Partial<Collection>): Promise<number> {
    const result = await this.nativeUpdate({ id }, data);
    return result;
  }

  /**
   * 컬렉션을 삭제합니다.
   * @param id 컬렉션 ID
   * @returns 영향 받은 행 수
   */
  async deleteCollection(id: string): Promise<number> {
    const result = await this.nativeDelete({ id });
    return result;
  }

  /**
   * 사용자의 모든 컬렉션을 삭제합니다.
   * @param ownerId 소유자 ID
   * @returns 영향 받은 행 수
   */
  async deleteAllCollectionsByOwnerId(ownerId: string): Promise<number> {
    const result = await this.nativeDelete({ owner: ownerId });
    return result;
  }
} 