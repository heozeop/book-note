import { BaseRepository } from "@/common/repositories/base.repository";
import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { Thought } from "../entities/thought.entity";

@Injectable()
export class ThoughtRepository extends BaseRepository<Thought> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Thought");
  }

  /**
   * Find thoughts by page note ID
   * @param pageNoteId Page note ID
   * @returns Thought array
   */
  async findByPageNoteId(pageNoteId: string): Promise<Thought[]> {
    return this.find({ pageNote: { id: pageNoteId } });
  }

  async findByQuoteId(quoteId: string): Promise<Thought[]> {
    return this.find(
      { quote: quoteId, parentThought: null }, 
      { orderBy: { orderIndex: 'ASC' }, populate: ['childThoughts'] }
    );
  }

  async findByIdAndPageNoteId(id: string, pageNoteId: string): Promise<Thought | null> {
    return this.findOne({ id, pageNote: pageNoteId });
  }
} 