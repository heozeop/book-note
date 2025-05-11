import { Expose, Type } from 'class-transformer';
import { TagResponseDto } from './tag.response.dto';

/**
 * Book with tags response DTO
 * Represents a book with its associated tags in the response
 */
export class BookWithTagsResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  author: string;

  @Expose()
  isbn?: string;

  @Expose()
  description?: string;

  @Expose()
  coverUrl?: string;

  @Expose()
  publisher?: string;

  @Expose()
  publishedDate?: Date;

  @Expose()
  pageCount?: number;

  @Expose()
  @Type(() => TagResponseDto)
  tags: TagResponseDto[] = [];

  /**
   * Transform a UserBook entity with tags into a response DTO
   */
  static fromUserBookWithTags(userBook: any, bookTags: any[] = []): BookWithTagsResponseDto | null {
    if (!userBook || !userBook.book) {
      return null;
    }
    
    const book = userBook.book;
    
    const dto = new BookWithTagsResponseDto();
    dto.id = userBook.id; // Use the UserBook ID as expected by e2e tests
    dto.title = book.title;
    dto.author = book.author || '';
    dto.isbn = book.isbn;
    dto.description = book.description;
    dto.coverUrl = book.coverUrl;
    dto.publisher = book.publisher;
    dto.publishedDate = book.publishedDate;
    dto.pageCount = book.pageCount;
    
    // Transform book tags to tag response DTOs
    if (Array.isArray(bookTags)) {
      dto.tags = bookTags
        .filter(bookTag => bookTag.tag)
        .map(bookTag => {
          const tagDto = new TagResponseDto();
          tagDto.id = bookTag.tag.id;
          tagDto.name = bookTag.tag.name;
          tagDto.userId = bookTag.tag.userId;
          return tagDto;
        });
    }
    
    return dto;
  }
} 