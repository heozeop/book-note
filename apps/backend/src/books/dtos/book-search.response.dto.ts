import { BookItem, BookSearchResponse } from '../modules/book-search/interfaces/book-search.interface';

export class BookSearchItemResponseDto {
  title: string;
  author: string;
  publisher: string;
  publishedDate?: Date;
  isbn: string;
  description: string;
  coverUrl: string;
  price?: number;
  discount?: number;
  externalId?: string;
  subTitle?: string;
  pageCount?: number;
  language?: string;

  static fromBookItem(bookItem: BookItem): BookSearchItemResponseDto {
    const dto = new BookSearchItemResponseDto();
    dto.title = bookItem.title;
    dto.author = bookItem.author;
    dto.publisher = bookItem.publisher;
    dto.publishedDate = bookItem.publishedDate;
    dto.isbn = bookItem.isbn;
    dto.description = bookItem.description;
    dto.coverUrl = bookItem.coverUrl;
    dto.price = bookItem.price;
    dto.discount = bookItem.discount;
    dto.externalId = bookItem.externalId;
    dto.subTitle = bookItem.subTitle;
    dto.pageCount = bookItem.pageCount;
    dto.language = bookItem.language;
    return dto;
  }
}

export class BookSearchResponseDto {
  total: number;
  start: number;
  display: number;
  page?: number;
  items: BookSearchItemResponseDto[];

  static fromSearchResponse(response: BookSearchResponse): BookSearchResponseDto {
    const dto = new BookSearchResponseDto();
    dto.total = response.total;
    dto.start = response.start;
    dto.display = response.display;
    dto.page = response.page;
    dto.items = response.items.map(item => BookSearchItemResponseDto.fromBookItem(item));
    return dto;
  }
} 