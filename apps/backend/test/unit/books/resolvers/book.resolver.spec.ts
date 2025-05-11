import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { Book } from '../../../../src/books/entities/book.entity';
import { BookSearchResponse, IBookSearchService } from '../../../../src/books/interfaces/book-search.interface';
import { BookResolver } from '../../../../src/books/resolvers/book.resolver';
import { BookService } from '../../../../src/books/services/book.service';
import { NaverBooksApiService } from '../../../../src/books/services/naver-books-api.service';

describe('BookResolver', () => {
  let resolver: BookResolver;
  let bookService: BookService;
  let naverBooksApiService: NaverBooksApiService;
  let bookSearchService: IBookSearchService;

  const createMockBook = (overrides = {}): Book => {
    const book = new Book();
    book.id = v4();
    book.title = 'Test Book';
    book.author = 'Test Author';
    book.createdAt = new Date();
    book.updatedAt = new Date();
    
    // Apply any overrides
    Object.assign(book, overrides);
    
    return book;
  };

  beforeEach(async () => {
    // Mock the BookService
    const mockBookService = {
      findAllBooks: jest.fn(),
      findBookById: jest.fn(),
      createBookFromIsbn: jest.fn(),
      updateBook: jest.fn(),
      deleteBook: jest.fn(),
      searchBooksByTitleQuery: jest.fn(),
      searchBooksByTitle: jest.fn(),
    };
    
    // Mock the NaverBooksApiService
    const mockNaverBooksApiService = {
      searchByTitle: jest.fn(),
    };

    // Mock the BookSearchService
    const mockBookSearchService = {
      searchByTitle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookResolver,
        {
          provide: BookService,
          useValue: mockBookService,
        },
        {
          provide: NaverBooksApiService,
          useValue: mockNaverBooksApiService,
        },
        {
          provide: 'BOOK_SEARCH_SERVICE',
          useValue: mockBookSearchService,
        },
      ],
    }).compile();

    resolver = module.get<BookResolver>(BookResolver);
    bookService = module.get<BookService>(BookService);
    naverBooksApiService = module.get<NaverBooksApiService>(NaverBooksApiService);
    bookSearchService = module.get('BOOK_SEARCH_SERVICE');
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('books', () => {
    it('should get all books', async () => {
      // Given
      const mockBooks = [
        createMockBook({ title: 'Book 1' }),
        createMockBook({ title: 'Book 2' }),
      ];

      jest.spyOn(bookService, 'findAllBooks').mockResolvedValue(mockBooks);

      // When
      const result = await resolver.books();

      // Then
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Book 1');
      expect(result[1].title).toBe('Book 2');
      expect(bookService.findAllBooks).toHaveBeenCalled();
    });
  });

  describe('book', () => {
    it('should get a book by id', async () => {
      // Given
      const bookId = v4();
      const mockBook = createMockBook({ id: bookId });

      jest.spyOn(bookService, 'findBookById').mockResolvedValue(mockBook);

      // When
      const result = await resolver.book(bookId);

      // Then
      expect(result.id).toBe(bookId);
      expect(result.title).toBe('Test Book');
      expect(bookService.findBookById).toHaveBeenCalledWith(bookId);
    });
  });

  describe('searchLocalBooks', () => {
    it('should search books by title query', async () => {
      // Given
      const query = 'Design';
      const mockBooks = [
        createMockBook({ title: 'Design Patterns' }),
        createMockBook({ title: 'Domain-Driven Design' }),
      ];

      jest.spyOn(bookService, 'searchBooksByTitleQuery').mockResolvedValue(mockBooks);

      // When
      const result = await resolver.searchLocalBooks(query);

      // Then
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Design Patterns');
      expect(result[1].title).toBe('Domain-Driven Design');
      expect(bookService.searchBooksByTitleQuery).toHaveBeenCalledWith(query);
    });
  });

  describe('createBookFromIsbn', () => {
    it('should create a book from ISBN', async () => {
      // Given
      const isbn = '9788966260959';
      const mockBook = createMockBook({
        title: 'Clean Code',
        isbn,
      });

      jest.spyOn(bookService, 'createBookFromIsbn').mockResolvedValue(mockBook);

      // When
      const result = await resolver.createBookFromIsbn(isbn);

      // Then
      expect(result.title).toBe('Clean Code');
      expect(result.isbn).toBe(isbn);
      expect(bookService.createBookFromIsbn).toHaveBeenCalledWith(isbn);
    });
  });

  describe('updateBook', () => {
    it('should update a book successfully', async () => {
      // Given
      const bookId = v4();
      const updateData = {
        title: 'Updated Book',
        description: 'Updated description',
      };

      const mockUpdatedBook = createMockBook({
        id: bookId,
        title: 'Updated Book',
        description: 'Updated description',
      });

      jest.spyOn(bookService, 'updateBook').mockResolvedValue(mockUpdatedBook);

      // When
      const result = await resolver.updateBook(bookId, updateData);

      // Then
      expect(result.id).toBe(bookId);
      expect(result.title).toBe('Updated Book');
      expect(result.description).toBe('Updated description');
      expect(bookService.updateBook).toHaveBeenCalledWith(bookId, updateData);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book successfully', async () => {
      // Given
      const bookId = v4();
      
      jest.spyOn(bookService, 'deleteBook').mockResolvedValue(true);

      // When
      const result = await resolver.deleteBook(bookId);

      // Then
      expect(result).toBe(true);
      expect(bookService.deleteBook).toHaveBeenCalledWith(bookId);
    });

    it('should return false if deletion failed', async () => {
      // Given
      const bookId = v4();
      
      jest.spyOn(bookService, 'deleteBook').mockResolvedValue(false);

      // When
      const result = await resolver.deleteBook(bookId);

      // Then
      expect(result).toBe(false);
      expect(bookService.deleteBook).toHaveBeenCalledWith(bookId);
    });
  });

  describe('searchBooks', () => {
    it('should search books using book service', async () => {
      // Given
      const title = 'Clean Code';
      const options = { display: 10, start: 1 };
      const mockResponse = { 
        total: 2,
        items: [
          { title: 'Clean Code', author: 'Robert C. Martin' },
          { title: 'Clean Architecture', author: 'Robert C. Martin' }
        ]
      };
      
      jest.spyOn(bookService, 'searchBooksByTitle').mockResolvedValue(mockResponse);
      
      // When
      const result = await resolver.searchBooks(title, options);
      
      // Then
      expect(result).toBe(mockResponse);
      expect(bookService.searchBooksByTitle).toHaveBeenCalledWith(title, options);
    });
  });

  describe('searchNaverBooks', () => {
    it('should search books using book service', async () => {
      // Given
      const title = 'Clean Code';
      const options = { display: 10, start: 1 };
      const mockResponse: BookSearchResponse = { 
        total: 2,
        start: 1,
        display: 2,
        items: [
          { 
            title: 'Clean Code', 
            author: 'Robert C. Martin',
            coverUrl: 'https://example.com/cover.jpg',
            publisher: 'Pearson',
            isbn: '9788966260959',
            description: 'A handbook of agile software craftsmanship',
          },
          { 
            title: 'Clean Architecture', 
            author: 'Robert C. Martin',
            coverUrl: 'https://example.com/cover2.jpg',
            publisher: 'Pearson',
            isbn: '9788966260960',
            description: 'A craftsman\'s guide to software structure and design',
          }
        ]
      };
      
      jest.spyOn(bookService, 'searchBooksByTitle').mockResolvedValue(mockResponse);
      
      // When
      const result = await resolver.searchNaverBooks(title, options.display, options.start);
      
      // Then
      expect(result).toBe(mockResponse);
      expect(bookService.searchBooksByTitle).toHaveBeenCalledWith(title, options);
    });
  });
}); 