import { EntityManager, FilterQuery } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { Note } from "../entities/note.entity";

@Injectable()
export class NoteRepository extends BaseRepository<Note> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Note");
  }

  /**
   * 사용자 ID로 모든 노트를 찾습니다.
   */
  async findByUserId(userId: string): Promise<Note[]> {
    return this.find({ user: userId });
  }

  /**
   * 책 ID로 모든 노트를 찾습니다.
   */
  async findByBookId(bookId: string): Promise<Note[]> {
    return this.find({ book: bookId });
  }

  /**
   * 사용자 ID와 책 ID로 모든 노트를 찾습니다.
   */
  async findByUserIdAndBookId(userId: string, bookId: string): Promise<Note[]> {
    return this.find({ user: userId, book: bookId });
  }

  /**
   * ID로 노트를 찾습니다.
   */
  async findById(id: string): Promise<Note | null> {
    return this.findOne(id);
  }

  /**
   * ID와 사용자 ID로 노트를 찾습니다.
   */
  async findByIdAndUserId(id: string, userId: string): Promise<Note | null> {
    return this.findOne({ id, user: userId });
  }

  /**
   * 노트를 삭제합니다.
   */
  async deleteNote(id: string): Promise<number> {
    return this.nativeDelete({ id });
  }

  /**
   * 사용자 ID로 노트를 삭제합니다.
   */
  async deleteNotesByUserId(userId: string): Promise<number> {
    return this.nativeDelete({ user: userId });
  }

  /**
   * 공개된 노트를 찾습니다.
   */
  async findPublicNotes(options?: { limit?: number; offset?: number }): Promise<Note[]> {
    const query: FilterQuery<Note> = { isPublic: true };
    return this.find(query, {
      limit: options?.limit,
      offset: options?.offset,
      populate: ['user', 'book'],
    });
  }
} 