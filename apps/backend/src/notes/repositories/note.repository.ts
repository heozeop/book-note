import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { Note } from "../entities/note.entity";

@Injectable()
export class NoteRepository extends BaseRepository<Note> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Note");
  }

  /**
   * Find a note by its ID
   */
  async findById(id: string): Promise<Note | null> {
    return this.findOne({ id });
  }

  /**
   * Find all notes for a specific book
   */
  async findByBookId(bookId: string): Promise<Note[]> {
    return this.find({ book: bookId });
  }

  /**
   * Find all notes for a specific user
   */
  async findByUserId(userId: string): Promise<Note[]> {
    return this.find({ author: userId });
  }

  /**
   * Delete a note and associated thoughts
   * Note: This should trigger cascade delete of associated thoughts
   */
  async deleteNote(id: string): Promise<void> {
    await this.nativeDelete({ id });
  }
}
