import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { User } from '../../../../src/auth/entities/user.entity';
import { BookController } from '../../../../src/books/controllers/book.controller';
import { CreateBookDto } from '../../../../src/books/dtos/create-book.dto';
import { UpdateBookDto } from '../../../../src/books/dtos/update-book.dto';
import { Book, BookStatus } from '../../../../src/books/entities/book.entity';
import { BookService } from '../../../../src/books/services/book.service';

describe('BookController', () => {
  let controller: BookController;
  let bookService: BookService;
  let mockUser: User;

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
      findCompletedBooks: jest.fn(),
      updateBook: jest.fn(),
      updateBookStatus: jest.fn(),
      deleteBook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    controller = module.get<BookController>(BookController);
    bookService = module.get<BookService>(BookService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      // Given
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        author: 'Test Author',
      };

      const expectedBook = new Book();
      expectedBook.id = v4();
      expectedBook.title = 'Test Book';
      expectedBook.author = 'Test Author';
      expectedBook.owner = mockUser;

      jest.spyOn(bookService, 'createBook').mockResolvedValue(expectedBook);

      // When
      const result = await controller.createBook(createBookDto, mockUser);

      // Then
      expect(result).toBe(expectedBook);
      expect(bookService.createBook).toHaveBeenCalledWith(createBookDto, mockUser);
    });
  });

  describe('getAllBooks', () => {
    it('should get all books when no status provided', async () => {
      // Given
      const expectedBooks = [
        { id: v4(), title: 'Book 1' },
        { id: v4(), title: 'Book 2' },
      ] as Book[];

      jest.spyOn(bookService, 'findAllBooks').mockResolvedValue(expectedBooks);

      // When
      const result = await controller.getAllBooks(mockUser);

      // Then
      expect(result).toBe(expectedBooks);
      expect(bookService.findAllBooks).toHaveBeenCalledWith(mockUser.id);
      expect(bookService.findBooksByStatus).not.toHaveBeenCalled();
    });

    it('should filter books by status when status provided', async () => {
      // Given
      const status = BookStatus.READING;
      const expectedBooks = [
        { id: v4(), title: 'Reading Book', status },
      ] as Book[];

      jest.spyOn(bookService, 'findBooksByStatus').mockResolvedValue(expectedBooks);

      // When
      const result = await controller.getAllBooks(mockUser, status);

      // Then
      expect(result).toBe(expectedBooks);
      expect(bookService.findBooksByStatus).toHaveBeenCalledWith(status, mockUser.id);
      expect(bookService.findAllBooks).not.toHaveBeenCalled();
    });
  });

  describe('getCompletedBooks', () => {
    it('should get completed books with default dates when not provided', async () => {
      // Given
      const expectedBooks = [
        { id: v4(), title: 'Completed Book', status: BookStatus.COMPLETED },
      ] as Book[];

      jest.spyOn(bookService, 'findCompletedBooks').mockResolvedValue(expectedBooks);
      
      // When
      const result = await controller.getCompletedBooks(mockUser);

      // Then
      expect(result).toBe(expectedBooks);
      expect(bookService.findCompletedBooks).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Date),
        expect.any(Date)
      );
    });

    it('should get completed books with provided date range', async () => {
      // Given
      const startDate = '2023-01-01';
      const endDate = '2023-12-31';
      const expectedBooks = [
        { id: v4(), title: 'Completed Book', status: BookStatus.COMPLETED },
      ] as Book[];

      jest.spyOn(bookService, 'findCompletedBooks').mockResolvedValue(expectedBooks);
      
      // When
      const result = await controller.getCompletedBooks(mockUser, startDate, endDate);

      // Then
      expect(result).toBe(expectedBooks);
      expect(bookService.findCompletedBooks).toHaveBeenCalledWith(
        mockUser.id,
        new Date(startDate),
        new Date(endDate)
      );
    });
  });

  describe('getBookById', () => {
    it('should get a book by id', async () => {
      // Given
      const bookId = v4();
      const expectedBook = {
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
      } as Book;

      jest.spyOn(bookService, 'findBookById').mockResolvedValue(expectedBook);

      // When
      const result = await controller.getBookById(bookId, mockUser);

      // Then
      expect(result).toBe(expectedBook);
      expect(bookService.findBookById).toHaveBeenCalledWith(bookId, mockUser.id);
    });

    it('should throw NotFoundException when book not found', async () => {
      // Given
      const bookId = v4();
      
      jest.spyOn(bookService, 'findBookById').mockRejectedValue(
        new NotFoundException(`ID ${bookId}인 책을 찾을 수 없습니다.`)
      );

      // When & Then
      await expect(controller.getBookById(bookId, mockUser))
        .rejects
        .toThrow(NotFoundException);
      expect(bookService.findBookById).toHaveBeenCalledWith(bookId, mockUser.id);
    });
  });

  describe('updateBook', () => {
    it('should update a book successfully', async () => {
      // Given
      const bookId = v4();
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };
      
      const expectedBook = {
        id: bookId,
        title: 'Updated Title',
        description: 'Updated description',
      } as Book;

      jest.spyOn(bookService, 'updateBook').mockResolvedValue(expectedBook);

      // When
      const result = await controller.updateBook(bookId, updateBookDto, mockUser);

      // Then
      expect(result).toBe(expectedBook);
      expect(bookService.updateBook).toHaveBeenCalledWith(bookId, updateBookDto, mockUser.id);
    });
  });

  describe('updateBookStatus', () => {
    it('should update book status successfully', async () => {
      // Given
      const bookId = v4();
      const status = BookStatus.READING;
      
      const expectedBook = {
        id: bookId,
        title: 'Test Book',
        status,
      } as Book;

      jest.spyOn(bookService, 'updateBookStatus').mockResolvedValue(expectedBook);

      // When
      const result = await controller.updateBookStatus(bookId, status, mockUser);

      // Then
      expect(result).toBe(expectedBook);
      expect(bookService.updateBookStatus).toHaveBeenCalledWith(bookId, status, mockUser.id);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book successfully', async () => {
      // Given
      const bookId = v4();
      
      jest.spyOn(bookService, 'deleteBook').mockResolvedValue(true);

      // When
      const result = await controller.deleteBook(bookId, mockUser);

      // Then
      expect(result).toEqual({ success: true });
      expect(bookService.deleteBook).toHaveBeenCalledWith(bookId, mockUser.id);
    });

    it('should return success false if deletion failed', async () => {
      // Given
      const bookId = v4();
      
      jest.spyOn(bookService, 'deleteBook').mockResolvedValue(false);

      // When
      const result = await controller.deleteBook(bookId, mockUser);

      // Then
      expect(result).toEqual({ success: false });
      expect(bookService.deleteBook).toHaveBeenCalledWith(bookId, mockUser.id);
    });
  });
}); 