import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NaverBooksApiService } from './naver/naver-books-api.service';

/**
 * 책 검색 모듈
 * 다양한 책 검색 서비스를 제공합니다.
 */
@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT', 5000),
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    NaverBooksApiService,
    {
      provide: 'BOOK_SEARCH_SERVICE',
      useExisting: NaverBooksApiService,
    },
  ],
  exports: [
    NaverBooksApiService,
    'BOOK_SEARCH_SERVICE',
  ],
})
export class BookSearchModule {} 