import { BaseRepository } from "@/common/repositories/base.repository";
import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { Reaction } from "../entities/reaction.entity";

@Injectable()
export class ReactionRepository extends BaseRepository<Reaction> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Reaction");
  }

  /**
   * Find reactions by page note ID
   * @param pageNoteId Page note ID
   * @returns Reaction array
   */
  async findByPageNoteId(pageNoteId: string): Promise<Reaction[]> {
    return this.find({ pageNote: { id: pageNoteId } });
  }

  async findByUserIdAndPageNoteId(userId: string, pageNoteId: string): Promise<Reaction | null> {
    return this.findOne({ user: userId, pageNote: pageNoteId });
  }
} 