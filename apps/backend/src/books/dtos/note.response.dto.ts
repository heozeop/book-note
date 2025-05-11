import { Expose, Type } from 'class-transformer';
import { Note } from '../entities/note.entity';

/**
 * Book reference DTO for use in note responses
 */
export class BookReferenceDto {
  @Expose()
  id: string;
}

/**
 * Note response DTO
 * Represents a note in the response
 */
export class NoteResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => BookReferenceDto)
  book: BookReferenceDto;

  @Expose()
  userId: string;

  @Expose()
  title?: string;

  @Expose()
  content: string;

  @Expose()
  page?: number;

  @Expose()
  isPublic: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  /**
   * Transform a Note entity into a response DTO that matches the e2e test expectations
   */
  static fromEntity(note: Note): NoteResponseDto | null {
    if (!note) {
      return null;
    }
    
    const dto = new NoteResponseDto();
    dto.id = note.id;
    
    // Create book reference to match e2e test expectations
    dto.book = new BookReferenceDto();
    dto.book.id = note.book?.id;
    
    dto.userId = note.user?.id;
    dto.title = note.title;
    dto.content = note.content;
    dto.page = note.page;
    dto.isPublic = note.isPublic;
    dto.createdAt = note.createdAt;
    dto.updatedAt = note.updatedAt;
    
    return dto;
  }
} 