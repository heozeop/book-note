import { Expose, Type } from 'class-transformer';
import { Book } from '../entities/book.entity';
import { UserBook } from '../entities/user-book.entity';
import { CollectionBookResponseDto } from './collection-book.response.dto';
import { TagResponseDto } from './tag.response.dto';

// Define a base type for all book-like objects
type BookLike = {
  id: string;
  title?: string;
  author?: string;
  isbn?: string;
  description?: string;
  coverUrl?: string;
  publisher?: string;
  publishedDate?: Date;
  pageCount?: number;
};

/**
 * Book response DTO
 * Represents a book in the response
 */
export class BookResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  author?: string;

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
  tags?: TagResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  /**
   * Transform a Book entity into a response DTO that matches the e2e test expectations
   */
  static fromBook(book: Book, tags: TagResponseDto[] = []): BookResponseDto {
    const dto = new BookResponseDto();
    dto.id = book.id;
    dto.title = book.title;
    dto.author = book.author;
    dto.isbn = book.isbn;
    dto.description = book.description;
    dto.coverUrl = book.coverUrl;
    dto.publisher = book.publisher;
    dto.publishedDate = book.publishedDate;
    dto.pageCount = book.pageCount;
    dto.createdAt = book.createdAt;
    dto.updatedAt = book.updatedAt;
    dto.tags = tags;
    
    return dto;
  }

  /**
   * Transform a UserBook entity into a response DTO
   */
  static fromUserBook(userBook: UserBook, tags: TagResponseDto[] = []): BookResponseDto | null {
    if (!userBook || !userBook.book) {
      return null;
    }
    
    const dto = new BookResponseDto();
    dto.id = userBook.book.id;
    dto.title = userBook.book.title;
    dto.author = userBook.book.author;
    dto.isbn = userBook.book.isbn;
    dto.description = userBook.book.description;
    dto.coverUrl = userBook.book.coverUrl;
    dto.publisher = userBook.book.publisher;
    dto.publishedDate = userBook.book.publishedDate;
    dto.pageCount = userBook.book.pageCount;
    dto.createdAt = userBook.book.createdAt;
    dto.updatedAt = userBook.book.updatedAt;
    dto.tags = tags;
    
    return dto;
  }

  /**
   * Transform a CollectionBookResponseDto into a response DTO
   */
  static fromCollectionBook(collectionBook: CollectionBookResponseDto): BookResponseDto {
    const dto = new BookResponseDto();
    dto.id = collectionBook.id;
    dto.title = collectionBook.title;
    dto.author = collectionBook.author;
    dto.isbn = collectionBook.isbn;
    dto.description = collectionBook.description;
    dto.coverUrl = collectionBook.coverUrl;
    dto.publisher = collectionBook.publisher;
    dto.publishedDate = collectionBook.publishedDate;
    dto.pageCount = collectionBook.pageCount;
    dto.createdAt = new Date();
    dto.updatedAt = new Date();
    
    return dto;
  }

  /**
   * Transform any entity into a response DTO
   * This is a router method that calls the appropriate specific method
   */
  static fromEntity(
    entity: Book | UserBook | CollectionBookResponseDto | null, 
    tags: TagResponseDto[] = []
  ): BookResponseDto | null {
    if (!entity) {
      return null;
    }
    
    // Route to the appropriate method based on the entity type
    if (entity instanceof UserBook) {
      return BookResponseDto.fromUserBook(entity, tags);
    } else if (entity instanceof Book) {
      return BookResponseDto.fromBook(entity, tags);
    } else if (entity instanceof CollectionBookResponseDto) {
      return BookResponseDto.fromCollectionBook(entity);
    } else {
      return null;
    }
  }
} 