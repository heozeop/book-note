import { Expose } from 'class-transformer';
import { BookCollection } from '../entities/book-collection.entity';

/**
 * Collection book response DTO
 * Represents a book item in a collection
 */
export class CollectionBookResponseDto {
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

  /**
   * Transform a BookCollection object into a flattened response with 
   * direct access to the Book properties that the e2e tests expect
   */
  static fromBookCollection(bookCollection: BookCollection): CollectionBookResponseDto | null {
    if (!bookCollection || !bookCollection.book) {
      return null;
    }
    
    const book = bookCollection.book;
    
    const dto = new CollectionBookResponseDto();
    dto.id = book.id; // Using the Book ID as expected by e2e tests
    dto.title = book.title;
    dto.author = book.author;
    dto.isbn = book.isbn;
    dto.description = book.description;
    dto.coverUrl = book.coverUrl;
    dto.publisher = book.publisher;
    dto.publishedDate = book.publishedDate;
    dto.pageCount = book.pageCount;
    
    return dto;
  }
} 