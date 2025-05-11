import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../../auth/entities/user.entity";
import { CreateNoteDto } from "../dtos/create-note.dto";
import { Note } from "../entities/note.entity";
import { BookRepository } from "../repositories/book.repository";
import { NoteRepository } from "../repositories/note.repository";
import { UserBookRepository } from "../repositories/user-book.repository";

@Injectable()
export class NoteService {
  constructor(
    private readonly noteRepository: NoteRepository,
    private readonly bookRepository: BookRepository,
    private readonly userBookRepository: UserBookRepository,
  ) {}

  /**
   * 새 노트를 생성합니다.
   */
  async createNote(
    bookId: string,
    createNoteDto: CreateNoteDto,
    user: User,
  ): Promise<Note> {
    // 책이 존재하는지 확인
    const book = await this.bookRepository.findOne(bookId);
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // 사용자의 책 정보 조회 (있을 경우)
    const userBook = await this.userBookRepository.findUserBook(user.id, bookId);

    // 새 노트 생성
    const note = new Note();
    note.content = createNoteDto.content;
    note.title = createNoteDto.title;
    note.page = createNoteDto.page;
    note.isPublic = createNoteDto.isPublic || false;
    note.book = book;
    note.user = user;

    if (userBook) {
      note.userBook = userBook;
    }

    await this.noteRepository.persistAndFlush(note);
    return note;
  }

  /**
   * 사용자의 책에 대한 모든 노트를 조회합니다.
   */
  async findNotesByBookId(bookId: string, userId: string): Promise<Note[]> {
    return this.noteRepository.findByUserIdAndBookId(userId, bookId);
  }

  /**
   * 노트 ID로 노트를 조회합니다.
   */
  async findNoteById(id: string, userId: string): Promise<Note> {
    const note = await this.noteRepository.findByIdAndUserId(id, userId);
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  /**
   * 노트를 업데이트합니다.
   */
  async updateNote(
    id: string,
    updateData: Partial<CreateNoteDto>,
    userId: string,
  ): Promise<Note> {
    const note = await this.findNoteById(id, userId);

    // 업데이트할 필드 적용
    if (updateData.content !== undefined) {
      note.content = updateData.content;
    }
    if (updateData.title !== undefined) {
      note.title = updateData.title;
    }
    if (updateData.page !== undefined) {
      note.page = updateData.page;
    }
    if (updateData.isPublic !== undefined) {
      note.isPublic = updateData.isPublic;
    }

    await this.noteRepository.persistAndFlush(note);
    return note;
  }

  /**
   * 노트를 삭제합니다.
   */
  async deleteNote(id: string, userId: string): Promise<void> {
    const note = await this.findNoteById(id, userId);
    await this.noteRepository.getEntityManager().removeAndFlush(note);
  }

  /**
   * 공개된 노트를 조회합니다.
   */
  async findPublicNotes(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Note[]> {
    return this.noteRepository.findPublicNotes(options);
  }
} 