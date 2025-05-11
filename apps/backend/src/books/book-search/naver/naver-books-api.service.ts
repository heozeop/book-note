import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { BookItem, BookSearchParams, BookSearchResponse, IBookSearchService } from '../../interfaces/book-search.interface';
import { NaverBookItem, NaverBookSearchParams, NaverBookSearchResponse } from './naver-books-api.types';

/**
 * 네이버 책 검색 API 서비스
 * 네이버 개발자센터 API를 활용하여 책 정보를 검색합니다.
 */
@Injectable()
export class NaverBooksApiService implements IBookSearchService {
  private readonly logger = new Logger(NaverBooksApiService.name);
  private readonly baseUrl = 'https://openapi.naver.com/v1/search/book.json';
  private readonly apiClientId: string;
  private readonly apiClientSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiClientId = this.configService.get<string>('NAVER_CLIENT_ID', '');
    this.apiClientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET', '');

    if (!this.apiClientId || !this.apiClientSecret) {
      this.logger.warn('Naver API credentials not set! Book search will not work.');
    }
  }

  /**
   * 네이버 책 검색 API를 호출합니다.
   */
  async searchBooks(params: BookSearchParams): Promise<BookSearchResponse> {
    try {
      // 네이버 검색 파라미터로 변환
      const naverParams: NaverBookSearchParams = {
        query: params.query,
        display: params.display,
        start: params.start,
        sort: params.sort as 'sim' | 'date',
      };

      const response = await firstValueFrom(
        this.httpService.get<NaverBookSearchResponse>(this.baseUrl, {
          params: naverParams,
          headers: {
            'X-Naver-Client-Id': this.apiClientId,
            'X-Naver-Client-Secret': this.apiClientSecret,
          },
        })
      );
      
      // 네이버 응답을 공통 인터페이스 형식으로 변환
      const items = response.data.items.map(item => this.mapNaverItemToBookItem(item));
      
      return {
        total: response.data.total,
        start: response.data.start,
        display: response.data.display,
        items
      };
    } catch (error) {
      this.logger.error(`Error searching books: ${error.message}`, error.stack);
      throw new Error(`Failed to search books: ${error.message}`);
    }
  }

  /**
   * ISBN으로 책을 검색합니다.
   */
  async searchByIsbn(isbn: string): Promise<BookItem | null> {
    try {
      // ISBN에서 하이픈 제거
      const cleanIsbn = isbn.replace(/-/g, '');
      
      const result = await this.searchBooks({
        query: `isbn:${cleanIsbn}`,
        display: 1
      });

      if (result.total === 0 || !result.items.length) {
        return null;
      }

      return result.items[0];
    } catch (error) {
      this.logger.error(`Error searching by ISBN: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * 제목으로 책을 검색합니다.
   */
  async searchByTitle(title: string, options?: { display?: number; start?: number }): Promise<BookSearchResponse> {
    return this.searchBooks({
      query: title,
      display: options?.display || 10,
      start: options?.start || 1,
      sort: 'sim'
    });
  }

  /**
   * 네이버 API 결과를 애플리케이션 형식으로 변환합니다.
   */
  private mapNaverItemToBookItem(item: NaverBookItem): BookItem {
    // HTML 태그 제거 함수
    const stripHtmlTags = (str: string) => str ? str.replace(/<\/?[^>]+(>|$)/g, '') : str;
    
    // 제목에서 HTML 태그 제거
    const title = stripHtmlTags(item.title);
    
    // 부제목이 있는 경우 분리 (제목: 부제목 형식 처리)
    let mainTitle = title;
    let subTitle: string | undefined = undefined;
    
    const titleParts = title.split(':');
    if (titleParts.length > 1) {
      mainTitle = titleParts[0].trim();
      subTitle = titleParts.slice(1).join(':').trim();
    }

    // 문자열 -> 숫자 변환
    const parsePrice = (priceStr: string) => {
      const price = parseInt(priceStr?.replace(/[^\d]/g, ''), 10);
      return isNaN(price) ? undefined : price;
    };

    // 출판일 변환 (YYYYMMDD -> Date)
    const parsePubdate = (dateStr: string) => {
      if (!dateStr || dateStr.length !== 8) return undefined;
      
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1; // 0-based month
      const day = parseInt(dateStr.substring(6, 8), 10);
      
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? undefined : date;
    };

    return {
      title: mainTitle,
      subTitle,
      author: item.author,
      coverUrl: item.image,
      publisher: item.publisher,
      publishedDate: parsePubdate(item.pubdate),
      isbn: item.isbn,
      description: stripHtmlTags(item.description),
      price: parsePrice(item.price),
      discount: parsePrice(item.discount),
      // 직접적으로 네이버의 고유 ID는 제공되지 않으므로, link를 통해 유추
      externalId: item.link.split('=').pop() || undefined
    };
  }
} 