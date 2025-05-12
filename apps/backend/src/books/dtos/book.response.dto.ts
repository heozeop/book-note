import { Book } from '../modules/book/entities/book.entity';
import { TagResponseDto } from './tag.response.dto';

export class BookResponseDto {
  id: string;
  title: string;
  subTitle?: string;
  author?: string;
  isbn?: string;
  coverUrl?: string;
  description?: string;
  publishedDate?: Date;
  publisher?: string;
  pageCount?: number;
  price?: number;
  discount?: number;
  language?: string;
  tags: TagResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(book: Book, tags: TagResponseDto[] = []): BookResponseDto {
    const dto = new BookResponseDto();
    dto.id = book.id;
    dto.title = book.title;
    dto.subTitle = book.subTitle;
    dto.author = book.author;
    dto.isbn = book.isbn;
    dto.coverUrl = book.coverUrl;
    dto.description = book.description;
    dto.publishedDate = book.publishedDate;
    dto.publisher = book.publisher;
    dto.pageCount = book.pageCount;
    dto.price = book.price;
    dto.discount = book.discount;
    dto.language = book.language;
    dto.tags = tags;
    dto.createdAt = book.createdAt;
    dto.updatedAt = book.updatedAt;

    return dto;
  }
} 