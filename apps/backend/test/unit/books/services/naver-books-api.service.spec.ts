import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { NaverBooksApiService } from '../../../../src/books/book-search/naver/naver-books-api.service';
import { NaverBookItem } from '../../../../src/books/book-search/naver/naver-books-api.types';

describe('NaverBooksApiService', () => {
  let service: NaverBooksApiService;
  let configService: ConfigService;
  let httpService: HttpService;

  const mockNaverId = 'test-client-id';
  const mockNaverSecret = 'test-client-secret';
  
  const mockNaverBookItem: NaverBookItem = {
    title: '클린 코드: <b>프로그래밍</b> 원리',
    link: 'https://search.shopping.naver.com/book/catalog/32453295618',
    image: 'https://bookthumb-phinf.pstatic.net/cover/124/673/12467343.jpg',
    author: '로버트 C. 마틴',
    discount: '31500',
    publisher: '인사이트',
    pubdate: '20131212',
    isbn: '9788966260959',
    description: 'The bestselling <b>software</b> development book',
    price: '35000'
  };

  // Helper function to create mock AxiosResponse
  const createMockAxiosResponse = <T>(data: T): AxiosResponse<T> => {
    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} } as any
    };
  };

  beforeEach(async () => {
    // Mock ConfigService implementation
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'NAVER_CLIENT_ID') return mockNaverId;
        if (key === 'NAVER_CLIENT_SECRET') return mockNaverSecret;
        return defaultValue;
      }),
    };
    
    // Mock HttpService
    const mockHttpService = {
      get: jest.fn(),
    };
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NaverBooksApiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<NaverBooksApiService>(NaverBooksApiService);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchBooks', () => {
    it('should call Naver API with correct parameters', async () => {
      // Given
      const searchParams = { query: 'test book', display: 10 };
      const mockResponse = createMockAxiosResponse({
        lastBuildDate: '2023-01-01',
        total: 1,
        start: 1,
        display: 1,
        items: [mockNaverBookItem]
      });
      
      // Mock the httpService get method
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      // When
      const result = await service.searchBooks(searchParams);

      // Then
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://openapi.naver.com/v1/search/book.json',
        {
          params: searchParams,
          headers: {
            'X-Naver-Client-Id': mockNaverId,
            'X-Naver-Client-Secret': mockNaverSecret,
          },
        }
      );
      
      // Verify the transformation was done correctly
      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].title).toBe('클린 코드');
    });

    it('should handle API errors gracefully', async () => {
      // Given
      const searchParams = { query: 'test book' };
      
      // Mock HttpService to throw error
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new Error('API request failed');
      });

      // When & Then
      await expect(service.searchBooks(searchParams)).rejects.toThrow('Failed to search books: API request failed');
    });
  });

  describe('searchByIsbn', () => {
    it('should format ISBN and return processed book data', async () => {
      // Given
      const isbn = '978-89-6626-095-9';
      const mockResponse = createMockAxiosResponse({
        total: 1,
        start: 1,
        display: 1,
        items: [mockNaverBookItem]
      });
      
      // Mock the httpService get method
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));
      
      // When
      const result = await service.searchByIsbn(isbn);

      // Then
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            query: 'isbn:9788966260959'
          })
        })
      );
      
      expect(result).toBeDefined();
      expect(result?.title).toBe('클린 코드');
      expect(result?.isbn).toBe('9788966260959');
    });

    it('should return null when no books are found', async () => {
      // Given
      const isbn = '9780000000000';
      const mockResponse = createMockAxiosResponse({
        total: 0,
        items: []
      });
      
      // Mock the httpService get method
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      // When
      const result = await service.searchByIsbn(isbn);

      // Then
      expect(result).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      // Given
      const isbn = '9780000000000';
      
      // Mock HttpService to throw error
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new Error('API request failed');
      });

      // When
      const result = await service.searchByIsbn(isbn);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('mapNaverItemToBookItem', () => {
    it('should process Naver book item correctly', () => {
      // Given
      const mockResponse = createMockAxiosResponse({
        total: 1,
        start: 1,
        display: 1,
        items: [mockNaverBookItem]
      });
      
      // Mock the httpService get method
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      // When
      return service.searchBooks({ query: 'test' }).then(response => {
        const result = response.items[0];
      
        // Then
        expect(result).toEqual({
          title: '클린 코드',
          subTitle: undefined,
          author: '로버트 C. 마틴',
          coverUrl: 'https://bookthumb-phinf.pstatic.net/cover/124/673/12467343.jpg',
          publisher: '인사이트',
          publishedDate: new Date(2013, 11, 12),
          isbn: '9788966260959',
          description: 'The bestselling software development book',
          price: 35000,
          discount: 31500,
          externalId: expect.any(String)
        });
      });
    });

    it('should handle subtitle separation correctly', () => {
      // Given
      const bookWithSubtitle = {
        ...mockNaverBookItem,
        title: '클린 코드: 애자일 소프트웨어 장인 정신'
      };

      const mockResponse = createMockAxiosResponse({
        total: 1,
        start: 1,
        display: 1,
        items: [bookWithSubtitle]
      });
      
      // Mock the httpService get method
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      // When
      return service.searchBooks({ query: 'test' }).then(response => {
        const result = response.items[0];
        
        // Then
        expect(result.title).toBe('클린 코드');
        expect(result.subTitle).toBe('애자일 소프트웨어 장인 정신');
      });
    });
  });
}); 