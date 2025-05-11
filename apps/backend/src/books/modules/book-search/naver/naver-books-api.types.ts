/**
 * 네이버 책 검색 API 관련 타입 정의
 */

/**
 * 네이버 책 검색 API 호출 파라미터
 */
export interface NaverBookSearchParams {
  query: string;
  display?: number;
  start?: number;
  sort?: 'sim' | 'date';
}

/**
 * 네이버 책 검색 API 응답
 */
export interface NaverBookSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverBookItem[];
}

/**
 * 네이버 책 검색 API 아이템
 */
export interface NaverBookItem {
  title: string;
  link: string;
  image: string;
  author: string;
  discount: string;
  publisher: string;
  pubdate: string;
  isbn: string;
  description: string;
  price: string;
} 