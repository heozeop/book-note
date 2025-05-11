import { Expose, Type } from 'class-transformer';
import { BookStatus } from '../entities/reading-status.entity';
import { UserBook } from '../entities/user-book.entity';
import { BookResponseDto } from './book.response.dto';
import { TagResponseDto } from './tag.response.dto';

/**
 * UserBookResponseDto
 * Represents a user's book in the response, matching the e2e test expectations
 */
export class UserBookResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => BookResponseDto)
  book: BookResponseDto;

  @Expose()
  status: BookStatus;

  @Expose()
  startedAt?: Date;

  @Expose()
  finishedAt?: Date;

  @Expose()
  @Type(() => TagResponseDto)
  tags?: TagResponseDto[];

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  /**
   * Transform a UserBook entity into a response DTO
   */
  static fromEntity(userBook: UserBook, tags: TagResponseDto[] = []): UserBookResponseDto | null {
    if (!userBook || !userBook.book) {
      return null;
    }
    
    const dto = new UserBookResponseDto();
    dto.id = userBook.id;
    dto.status = userBook.status;
    dto.startedAt = userBook.startedAt;
    dto.finishedAt = userBook.finishedAt;
    dto.createdAt = userBook.createdAt;
    dto.updatedAt = userBook.updatedAt;
    dto.tags = tags;
    
    // Create book DTO
    dto.book = new BookResponseDto();
    dto.book.id = userBook.book.id;
    dto.book.title = userBook.book.title;
    dto.book.author = userBook.book.author;
    dto.book.isbn = userBook.book.isbn;
    dto.book.description = userBook.book.description;
    dto.book.coverUrl = userBook.book.coverUrl;
    dto.book.publisher = userBook.book.publisher;
    dto.book.publishedDate = userBook.book.publishedDate;
    dto.book.pageCount = userBook.book.pageCount;
    dto.book.createdAt = userBook.book.createdAt;
    dto.book.updatedAt = userBook.book.updatedAt;
    
    return dto;
  }
} 