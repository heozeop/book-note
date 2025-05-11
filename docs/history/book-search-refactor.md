# 도서 검색 모듈 리팩토링

## 개요

이 리팩토링은 도서 검색 API 서비스를 좀 더 유연하고 확장 가능한 구조로 만들기 위해 수행되었습니다. 주요 변경사항은 다음과 같습니다:

1. 새로운 도서 검색 모듈 생성 (`BookSearchModule`)
2. 최신 `@nestjs/axios` 패키지 사용
3. 인터페이스 기반 설계로 다양한 도서 검색 API 서비스를 쉽게 전환 가능

## 디렉토리 구조

```
src/books/
└── book-search/                  # 새 도서 검색 모듈
    ├── book-search.module.ts     # 도서 검색 모듈 정의
    ├── naver/                    # 네이버 책 검색 관련 파일들
    │   ├── naver-books-api.service.ts  # 네이버 책 검색 서비스
    │   └── naver-books-api.types.ts    # 네이버 책 검색 타입 정의
    │── (향후 다른 API 구현체들)
    └── interfaces/
        └── book-search.interface.ts  # 도서 검색 공통 인터페이스
```

## 주요 변경사항

1. **인터페이스 기반 설계**:
   - `IBookSearchService` 인터페이스를 정의하여 다양한 책 검색 API 구현체들이 공통 메서드를 구현하도록 함
   - `BookSearchParams`, `BookSearchResponse`, `BookItem` 등 공통 타입 정의

2. **의존성 주입 사용**:
   - `'BOOK_SEARCH_SERVICE'` 토큰을 통해 구현체를 주입받을 수 있도록 설계
   - 필요에 따라 다른 구현체로 쉽게 교체 가능

3. **@nestjs/axios 사용**:
   - `axios` 대신 NestJS에 최적화된 `@nestjs/axios` 패키지 사용
   - `HttpService`를 통한 HTTP 요청 처리
   - RxJS `Observable`에서 `Promise`로 변환하는 `firstValueFrom` 사용

4. **모듈 분리**:
   - 도서 검색 관련 기능을 별도 모듈로 분리
   - 책 검색 관련 코드의 응집도 향상

## 사용 방법

1. **모듈 가져오기**:
   ```typescript
   import { BookSearchModule } from './books/book-search/book-search.module';

   @Module({
     imports: [
       BookSearchModule,
       // ...
     ],
   })
   export class AppModule {}
   ```

2. **서비스 주입받기**:
   ```typescript
   @Injectable()
   export class YourService {
     constructor(
       @Inject('BOOK_SEARCH_SERVICE')
       private readonly bookSearchService: IBookSearchService,
     ) {}

     async searchBooks(query: string) {
       return this.bookSearchService.searchByTitle(query);
     }
   }
   ```

## 테스트

- `NaverBooksApiService` 및 `BookService`에 대한 테스트 업데이트
- `HttpService`를 모킹하여 HTTP 요청 테스트
- 의존성 주입 토큰을 사용한 테스트 구현

## 향후 확장성

새로운 도서 검색 API를 추가하려면:

1. `src/books/book-search/` 디렉토리에 새 서비스 구현
2. `IBookSearchService` 인터페이스를 구현
3. `BookSearchModule`의 providers에 등록
4. 필요시 디폴트 프로바이더 전환

```typescript
@Module({
  // ...
  providers: [
    NaverBooksApiService,
    NewBookSearchService,
    {
      provide: 'BOOK_SEARCH_SERVICE',
      useExisting: NewBookSearchService, // 네이버에서 새 서비스로 전환
    },
  ],
})
export class BookSearchModule {}
``` 
