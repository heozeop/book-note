import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { Tag } from "../entities/tag.entity";

@Injectable()
export class TagRepository extends BaseRepository<Tag> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Tag");
  }

  /**
   * 사용자 ID로 모든 태그를 찾습니다.
   */
  async findByUserId(userId: string): Promise<Tag[]> {
    return this.find({ userId });
  }

  /**
   * 이름과 사용자 ID로 태그를 찾습니다.
   */
  async findByNameAndUserId(name: string, userId: string): Promise<Tag | null> {
    return this.findOne({ name, userId });
  }
} 