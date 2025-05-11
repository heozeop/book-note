import { Collection } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { User } from '../../../../src/auth/entities/user.entity';
import { Book, BookStatus } from '../../../../src/books/entities/book.entity';
import { CreateBookInput } from '../../../../src/books/graphql/inputs/create-book.input';
import { UpdateBookInput } from '../../../../src/books/graphql/inputs/update-book.input';
import { BookResolver } from '../../../../src/books/resolvers/book.resolver';
import { BookService } from '../../../../src/books/services/book.service';

describe('BookResolver', () => {
  let resolver: BookResolver;
  let bookService: BookService;
  let mockUser: User;

  const createMockBook = (overrides = {}): Book => {
    const book = new Book();
    book.id = v4();
    book.title = 'Test Book';
    book.author = 'Test Author';
    book.status = BookStatus.WANT_TO_READ;
    book.createdAt = new Date();
    book.updatedAt = new Date();
    
    // Create a mock owner
    const owner = new User();
    owner.id = mockUser.id;
    book.owner = owner;
    
    // Create an empty notes collection
    book.notes = new Collection<any>(book);
    
    // Apply any overrides
    Object.assign(book, overrides);
    
    return book;
  };

  beforeEach(async () => {
    // Create a mock user
    mockUser = new User();
    mockUser.id = v4();
    mockUser.email = 'test@example.com';
    mockUser.displayName = 'Test User';

    // Mock the BookService
    const mockBookService = {
      createBook: jest.fn(),
      findAllBooks: jest.fn(),
      findBookById: jest.fn(),
      findBooksByStatus: jest.fn(),
      updateBook: jest.fn(),
      updateBookStatus: jest.fn(),
      deleteBook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookResolver,
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    resolver = module.get<BookResolver>(BookResolver);
    bookService = module.get<BookService>(BookService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getBooks', () => {
    it('should get all books when no status is provided', async () => {
      // Given
      const mockBooks = [
        createMockBook({ title: 'Book 1' }),
        createMockBook({ title: 'Book 2' }),
      ];

      jest.spyOn(bookService, 'findAllBooks').mockResolvedValue(mockBooks);

      // When
      const result = await resolver.getBooks(mockUser);

      // Then
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Book 1');
      expect(result[1].title).toBe('Book 2');
      expect(bookService.findAllBooks).toHaveBeenCalledWith(mockUser.id);
      expect(bookService.findBooksByStatus).not.toHaveBeenCalled();
    });

    it('should filter books by status when status is provided', async () => {
      // Given
      const status = BookStatus.READING;
      const mockBooks = [
        createMockBook({ title: 'Reading Book', status }),
      ];

      jest.spyOn(bookService, 'findBooksByStatus').mockResolvedValue(mockBooks);

      // When
      const result = await resolver.getBooks(mockUser, status);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Reading Book');
      expect(result[0].status).toBe(status);
      expect(bookService.findBooksByStatus).toHaveBeenCalledWith(status, mockUser.id);
      expect(bookService.findAllBooks).not.toHaveBeenCalled();
    });
  });

  describe('getBook', () => {
    it('should get a book by id', async () => {
      // Given
      const bookId = v4();
      const mockBook = createMockBook({ id: bookId });

      jest.spyOn(bookService, 'findBookById').mockResolvedValue(mockBook);

      // When
      const result = await resolver.getBook(bookId, mockUser);

      // Then
      expect(result.id).toBe(bookId);
      expect(result.title).toBe('Test Book');
      expect(bookService.findBookById).toHaveBeenCalledWith(bookId, mockUser.id);
    });

    it('should throw NotFoundException when book not found', async () => {
      // Given
      const bookId = v4();
      
      jest.spyOn(bookService, 'findBookById').mockRejectedValue(
        new NotFoundException(`ID ${bookId}인 책을 찾을 수 없습니다.`)
      );

      // When & Then
      await expect(resolver.getBook(bookId, mockUser))
        .rejects
        .toThrow(NotFoundException);
      expect(bookService.findBookById).toHaveBeenCalledWith(bookId, mockUser.id);
    });
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      // Given
      const createBookInput: CreateBookInput = {
        title: 'New Book',
        author: 'New Author',
        status: BookStatus.WANT_TO_READ,
      };

      const mockBook = createMockBook({
        title: 'New Book',
        author: 'New Author',
        status: BookStatus.WANT_TO_READ,
      });

      jest.spyOn(bookService, 'createBook').mockResolvedValue(mockBook);

      // When
      const result = await resolver.createBook(createBookInput, mockUser);

      // Then
      expect(result.title).toBe('New Book');
      expect(result.author).toBe('New Author');
      expect(result.status).toBe(BookStatus.WANT_TO_READ);
      expect(bookService.createBook).toHaveBeenCalledWith(createBookInput, mockUser);
    });
  });

  describe('updateBook', () => {
    it('should update a book successfully', async () => {
      // Given
      const bookId = v4();
      const updateBookInput: UpdateBookInput = {
        title: 'Updated Book',
        description: 'Updated description',
      };

      const mockBook = createMockBook({
        id: bookId,
        title: 'Updated Book',
        description: 'Updated description',
      });

      jest.spyOn(bookService, 'updateBook').mockResolvedValue(mockBook);

      // When
      const result = await resolver.updateBook(bookId, updateBookInput, mockUser);

      // Then
      expect(result.id).toBe(bookId);
      expect(result.title).toBe('Updated Book');
      expect(result.description).toBe('Updated description');
      expect(bookService.updateBook).toHaveBeenCalledWith(bookId, updateBookInput, mockUser.id);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book successfully', async () => {
      // Given
      const bookId = v4();
      
      jest.spyOn(bookService, 'deleteBook').mockResolvedValue(true);

      // When
      const result = await resolver.deleteBook(bookId, mockUser);

      // Then
      expect(result).toBe(true);
      expect(bookService.deleteBook).toHaveBeenCalledWith(bookId, mockUser.id);
    });

    it('should return false if deletion failed', async () => {
      // Given
      const bookId = v4();
      
      jest.spyOn(bookService, 'deleteBook').mockResolvedValue(false);

      // When
      const result = await resolver.deleteBook(bookId, mockUser);

      // Then
      expect(result).toBe(false);
      expect(bookService.deleteBook).toHaveBeenCalledWith(bookId, mockUser.id);
    });
  });

  describe('updateBookStatus', () => {
    it('should update book status successfully', async () => {
      // Given
      const bookId = v4();
      const status = BookStatus.READING;
      
      const mockBook = createMockBook({
        id: bookId,
        status,
      });

      jest.spyOn(bookService, 'updateBookStatus').mockResolvedValue(mockBook);

      // When
      const result = await resolver.updateBookStatus(bookId, status, mockUser);

      // Then
      expect(result.id).toBe(bookId);
      expect(result.status).toBe(status);
      expect(bookService.updateBookStatus).toHaveBeenCalledWith(bookId, status, mockUser.id);
    });
  });
}); 