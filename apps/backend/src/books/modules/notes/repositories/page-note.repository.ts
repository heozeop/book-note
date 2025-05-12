import { BaseRepository } from "@/common/repositories/base.repository";
import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { PageNote } from "../entities/page-note.entity";

@Injectable()
export class PageNoteRepository extends BaseRepository<PageNote> {
  constructor(protected readonly em: EntityManager) {
    super(em, "PageNote");
  }

  /**
   * Find notes by user and book
   * @param userId User ID
   * @param bookId Book ID
   * @returns PageNote array
   */
  async findByUserAndBook(userId: string, bookId: string): Promise<PageNote[]> {
    return this.find({ 
      userBook: { 
        user: { id: userId },
        book: { id: bookId }
      }
    });
  }

  /**
   * Find note by ID and user
   * @param id Note ID
   * @param userId User ID
   * @returns PageNote or null
   */
  async findByIdAndUser(id: string, userId: string): Promise<PageNote | null> {
    return this.findOne({
      id,
      userBook: { user: { id: userId } }
    });
  }
} 