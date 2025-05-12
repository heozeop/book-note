import { BaseRepository } from "@/common/repositories/base.repository";
import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { Quote } from "../entities/quote.entity";

@Injectable()
export class QuoteRepository extends BaseRepository<Quote> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Quote");
  }

  /**
   * Find quotes by page note ID
   * @param pageNoteId Page note ID
   * @returns Quote array
   */
  async findByPageNoteId(pageNoteId: string): Promise<Quote[]> {
    return this.find({ pageNote: { id: pageNoteId } });
  }

  async findByIdAndPageNoteId(id: string, pageNoteId: string): Promise<Quote | null> {
    return this.findOne({ id, pageNote: pageNoteId });
  }
} 