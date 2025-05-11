/**
 * 책 검색 서비스를 위한 인터페이스
 * 서로 다른 책 검색 API 구현체가 공통으로 준수해야 하는 계약입니다.
 */

export interface BookSearchParams {
  query: string;
  display?: number;
  start?: number;
  sort?: string;
}

export interface BookSearchResponse {
  total: number;
  start: number;
  display: number;
  page?: number;
  items: BookItem[];
}

export interface BookItem {
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
}

export interface IBookSearchService {
  /**
   * 검색어로 책을 검색합니다.
   */
  searchBooks(params: BookSearchParams): Promise<BookSearchResponse>;
  
  /**
   * ISBN으로 책을 검색합니다.
   */
  searchByIsbn(isbn: string): Promise<BookItem | null>;
  
  /**
   * 제목으로 책을 검색합니다.
   */
  searchByTitle(title: string, options?: { display?: number; start?: number }): Promise<BookSearchResponse>;
} 