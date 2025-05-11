import { MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateBookDto } from '../../../../src/books/dtos/create-book.dto';
import { Book } from '../../../../src/books/entities/book.entity';
import { BookItem } from '../../../../src/books/interfaces/book-search.interface';
import { BookRepository } from '../../../../src/books/repositories/book.repository';
import { BookService } from '../../../../src/books/services/book.service';
import { BooksTestModule } from '../books-test.module';

describe('BookService', () => {
  let service: BookService;
  let repository: BookRepository;
  let bookSearchService: any; // IBookSearchService
  let orm: MikroORM;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BooksTestModule],
    })
    .overrideProvider('BOOK_SEARCH_SERVICE')
    .useValue({
      searchByIsbn: jest.fn(),
      searchByTitle: jest.fn(),
    })
    .compile();

    service = module.get<BookService>(BookService);
    repository = module.get<BookRepository>(BookRepository);
    bookSearchService = module.get('BOOK_SEARCH_SERVICE');
    orm = module.get<MikroORM>(MikroORM);

    await orm.getSchemaGenerator().createSchema();
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(bookSearchService).toBeDefined();
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      // Given
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '9781234567897',
        coverUrl: 'https://example.com/cover.jpg',
        description: 'A test book description',
        publisher: 'Test Publisher',
        publishedDate: new Date('2023-01-01'),
        pageCount: 300,
        price: 25000,
        metadata: { genre: 'Fiction', tags: ['test', 'fantasy'] },
      };

      // When
      const result = await service.createBook(createBookDto);

      // Then
      expect(result).toBeDefined();
      expect(result.title).toBe('Test Book');
      expect(result.author).toBe('Test Author');
      expect(result.isbn).toBe('9781234567897');
      expect(result.pageCount).toBe(300);
      
      // Verify it was saved to the database
      const savedBook = await repository.findOne({ title: 'Test Book' });
      expect(savedBook).toBeDefined();
      expect(savedBook?.id).toBe(result.id);
    });

    it('should create a book with minimal information', async () => {
      // Given
      const createBookDto: CreateBookDto = {
        title: 'Minimal Book',
      };

      // When
      const result = await service.createBook(createBookDto);

      // Then
      expect(result).toBeDefined();
      expect(result.title).toBe('Minimal Book');
      expect(result.author).toBeUndefined();
    });

    it('should return existing book if found by ISBN', async () => {
      // Given
      const existingBook = new Book();
      existingBook.title = 'Existing Book';
      existingBook.isbn = '9781234567897';
      
      await orm.em.persistAndFlush(existingBook);
      orm.em.clear();
      
      const createBookDto: CreateBookDto = {
        title: 'Different Title',
        isbn: '9781234567897',
      };
      
      // When
      const result = await service.createBook(createBookDto);
      
      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(existingBook.id);
      expect(result.title).toBe('Existing Book');
    });
    
    it('should return existing book if found by naverBookId', async () => {
      // Given
      const existingBook = new Book();
      existingBook.title = 'Existing Book';
      existingBook.naverBookId = '12345';
      
      await orm.em.persistAndFlush(existingBook);
      orm.em.clear();
      
      const createBookDto: CreateBookDto = {
        title: 'Different Title',
        naverBookId: '12345',
      };
      
      // When
      const result = await service.createBook(createBookDto);
      
      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(existingBook.id);
      expect(result.title).toBe('Existing Book');
    });
    
    it('should return existing book if found by title and author', async () => {
      // Given
      const existingBook = new Book();
      existingBook.title = 'Existing Book';
      existingBook.author = 'Existing Author';
      
      await orm.em.persistAndFlush(existingBook);
      orm.em.clear();
      
      const createBookDto: CreateBookDto = {
        title: 'Existing Book',
        author: 'Existing Author',
      };
      
      // When
      const result = await service.createBook(createBookDto);
      
      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(existingBook.id);
    });
  });

  describe('findAllBooks', () => {
    it('should find all books', async () => {
      // Given
      const book1 = new Book();
      book1.title = 'Book 1';
      book1.author = 'Author 1';

      const book2 = new Book();
      book2.title = 'Book 2';
      book2.author = 'Author 2';

      await orm.em.persistAndFlush([book1, book2]);
      orm.em.clear();

      // When
      const result = await service.findAllBooks();

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Book 1');
      expect(result[1].title).toBe('Book 2');
    });

    it('should return empty array if no books', async () => {
      // When
      const result = await service.findAllBooks();

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('findBookById', () => {
    it('should find a book by ID', async () => {
      // Given
      const book = new Book();
      book.title = 'Test Book';
      book.author = 'Test Author';

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      // When
      const result = await service.findBookById(book.id);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(book.id);
      expect(result.title).toBe('Test Book');
    });

    it('should throw NotFoundException if book not found', async () => {
      // When & Then
      await expect(service.findBookById('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('updateBook', () => {
    it('should update a book successfully', async () => {
      // Given
      const book = new Book();
      book.title = 'Original Title';
      book.author = 'Original Author';
      
      await orm.em.persistAndFlush(book);
      orm.em.clear();
      
      const updateData: Partial<Book> = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      
      // When
      const result = await service.updateBook(book.id, updateData);
      
      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(book.id);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated Description');
      expect(result.author).toBe('Original Author');
    });
    
    it('should throw NotFoundException if book not found', async () => {
      // When & Then
      await expect(service.updateBook('non-existent-id', { title: 'New Title' }))
        .rejects
        .toThrow(NotFoundException);
    });
  });
  
  describe('deleteBook', () => {
    it('should delete a book successfully', async () => {
      // Given
      const book = new Book();
      book.title = 'Book to Delete';
      
      await orm.em.persistAndFlush(book);
      orm.em.clear();
      
      // When
      const result = await service.deleteBook(book.id);
      
      // Then
      expect(result).toBe(true);
      
      // Verify it was deleted from the database
      const deletedBook = await repository.findOne(book.id);
      expect(deletedBook).toBeNull();
    });
    
    it('should throw NotFoundException if book not found', async () => {
      // When & Then
      await expect(service.deleteBook('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
  
  describe('searchBooksByTitleQuery', () => {
    it('should find books by title query', async () => {
      // Given
      const book1 = new Book();
      book1.title = 'Design Patterns';
      
      const book2 = new Book();
      book2.title = 'Clean Code';
      
      const book3 = new Book();
      book3.title = 'Domain-Driven Design';
      
      await orm.em.persistAndFlush([book1, book2, book3]);
      orm.em.clear();
      
      // When
      const result = await service.searchBooksByTitleQuery('Design');
      
      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result.map(b => b.title).sort()).toEqual(['Design Patterns', 'Domain-Driven Design'].sort());
    });
    
    it('should return empty array if no matches', async () => {
      // Given
      const book = new Book();
      book.title = 'Clean Code';
      
      await orm.em.persistAndFlush(book);
      orm.em.clear();
      
      // When
      const result = await service.searchBooksByTitleQuery('NonExistentTitle');
      
      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });
  
  describe('createBookFromIsbn', () => {
    it('should create a book from ISBN using search service', async () => {
      // Given
      const isbn = '9788966260959';
      const mockBookData: BookItem = {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9788966260959',
        coverUrl: 'https://example.com/cover.jpg',
        publisher: 'Pearson',
        description: 'A handbook of agile software craftsmanship',
      };
      
      jest.spyOn(bookSearchService, 'searchByIsbn').mockResolvedValue(mockBookData);
      jest.spyOn(service, 'createBookFromSearchData').mockResolvedValue({
        id: 'new-id',
        ...mockBookData,
      } as Book);
      
      // When
      const result = await service.createBookFromIsbn(isbn);
      
      // Then
      expect(result).toBeDefined();
      expect(result.title).toBe('Clean Code');
      expect(result.isbn).toBe(isbn);
      expect(bookSearchService.searchByIsbn).toHaveBeenCalledWith(isbn);
      expect(service.createBookFromSearchData).toHaveBeenCalledWith(mockBookData);
    });
    
    it('should return existing book if already in database', async () => {
      // Given
      const isbn = '9788966260959';
      const existingBook = new Book();
      existingBook.title = 'Existing Book';
      existingBook.isbn = isbn;
      
      await orm.em.persistAndFlush(existingBook);
      orm.em.clear();
      
      // When
      const result = await service.createBookFromIsbn(isbn);
      
      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(existingBook.id);
      expect(result.title).toBe('Existing Book');
      expect(bookSearchService.searchByIsbn).not.toHaveBeenCalled();
    });
    
    it('should throw NotFoundException if no book found with ISBN', async () => {
      // Given
      const isbn = '9780000000000';
      jest.spyOn(bookSearchService, 'searchByIsbn').mockResolvedValue(null);
      
      // When & Then
      await expect(service.createBookFromIsbn(isbn))
        .rejects
        .toThrow(NotFoundException);
      expect(bookSearchService.searchByIsbn).toHaveBeenCalledWith(isbn);
    });
  });
  
  describe('createBookFromSearchData', () => {
    it('should create a book from search data', async () => {
      // Given
      const bookData: BookItem = {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9788966260959',
        coverUrl: 'https://example.com/cover.jpg',
        publisher: 'Pearson',
        description: 'A handbook of agile software craftsmanship',
        externalId: '12345'
      };
      
      // When
      const result = await service.createBookFromSearchData(bookData);
      
      // Then
      expect(result).toBeDefined();
      expect(result.title).toBe('Clean Code');
      expect(result.author).toBe('Robert C. Martin');
      expect(result.isbn).toBe('9788966260959');
      expect(result.naverBookId).toBe('12345');
      
      // Verify it was saved to the database
      const savedBook = await repository.findOne({ naverBookId: '12345' });
      expect(savedBook).toBeDefined();
      expect(savedBook?.id).toBe(result.id);
    });
  });
  
  describe('searchBooksByTitle', () => {
    it('should call search service searchByTitle', async () => {
      // Given
      const title = 'Clean Code';
      const options = { display: 10, start: 1 };
      const mockResponse = { items: [] };
      
      jest.spyOn(bookSearchService, 'searchByTitle').mockResolvedValue(mockResponse);
      
      // When
      const result = await service.searchBooksByTitle(title, options);
      
      // Then
      expect(result).toBe(mockResponse);
      expect(bookSearchService.searchByTitle).toHaveBeenCalledWith(title, options);
    });
  });
}); 