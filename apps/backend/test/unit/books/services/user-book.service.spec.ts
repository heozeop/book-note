import { MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../../src/auth/entities/user.entity';
import { CreateUserBookDto } from '../../../../src/books/dtos/create-user-book.dto';
import { Book } from '../../../../src/books/entities/book.entity';
import { BookStatus } from '../../../../src/books/entities/reading-status.entity';
import { UserBook } from '../../../../src/books/entities/user-book.entity';
import { BookRepository } from '../../../../src/books/repositories/book.repository';
import { UserBookRepository } from '../../../../src/books/repositories/user-book.repository';
import { UserBookService } from '../../../../src/books/services/user-book.service';
import { BooksTestModule } from '../books-test.module';

describe('UserBookService', () => {
  let service: UserBookService;
  let userBookRepository: UserBookRepository;
  let bookRepository: BookRepository;
  let orm: MikroORM;
  let testUser: User;
  let testBook: Book;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BooksTestModule],
    }).compile();

    service = module.get<UserBookService>(UserBookService);
    userBookRepository = module.get<UserBookRepository>(UserBookRepository);
    bookRepository = module.get<BookRepository>(BookRepository);
    orm = module.get<MikroORM>(MikroORM);

    await orm.getSchemaGenerator().createSchema();
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();
    
    // Create test user
    testUser = new User();
    testUser.email = 'test@example.com';
    testUser.passwordHash = 'hashed_password';
    testUser.displayName = 'Test User';
    
    // Create test book
    testBook = new Book();
    testBook.title = 'Test Book';
    testBook.author = 'Test Author';
    testBook.isbn = '9781234567897';
    
    await orm.em.persistAndFlush([testUser, testBook]);
    orm.em.clear();
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userBookRepository).toBeDefined();
    expect(bookRepository).toBeDefined();
  });

  describe('createUserBook', () => {
    it('should create a user book successfully', async () => {
      // Given
      const createUserBookDto: CreateUserBookDto = {
        bookId: testBook.id,
        isPrivate: true,
        status: BookStatus.WANT_TO_READ,
      };

      // When
      const result = await service.createUserBook(createUserBookDto, testUser);

      // Then
      expect(result).toBeDefined();
      expect(result.book.id).toBe(testBook.id);
      expect(result.user.id).toBe(testUser.id);
      expect(result.isPrivate).toBe(true);
      expect(result.status).toBe(BookStatus.WANT_TO_READ);
      
      // Verify it was saved to the database
      const savedUserBook = await userBookRepository.findOne({ 
        user: { id: testUser.id },
        book: { id: testBook.id }
      });
      expect(savedUserBook).toBeDefined();
      expect(savedUserBook?.id).toBe(result.id);
    });

    it('should throw NotFoundException if book not found', async () => {
      // Given
      const createUserBookDto: CreateUserBookDto = {
        bookId: 'non-existent-id',
      };

      // When & Then
      await expect(service.createUserBook(createUserBookDto, testUser))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should return existing user book if already exists', async () => {
      // Given
      const existingUserBook = new UserBook();
      existingUserBook.user = testUser;
      existingUserBook.book = testBook;
      existingUserBook.status = BookStatus.READING;
      
      await orm.em.persistAndFlush(existingUserBook);
      orm.em.clear();
      
      const createUserBookDto: CreateUserBookDto = {
        bookId: testBook.id,
        status: BookStatus.COMPLETED,
      };

      // When
      const result = await service.createUserBook(createUserBookDto, testUser);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(existingUserBook.id);
      expect(result.status).toBe(BookStatus.READING); // Should not change status
    });

    it('should set startedAt when status is READING', async () => {
      // Given
      const createUserBookDto: CreateUserBookDto = {
        bookId: testBook.id,
        status: BookStatus.READING,
      };

      // When
      const result = await service.createUserBook(createUserBookDto, testUser);

      // Then
      expect(result.startedAt).toBeDefined();
    });

    it('should set finishedAt when status is COMPLETED', async () => {
      // Given
      const createUserBookDto: CreateUserBookDto = {
        bookId: testBook.id,
        status: BookStatus.COMPLETED,
      };

      // When
      const result = await service.createUserBook(createUserBookDto, testUser);

      // Then
      expect(result.finishedAt).toBeDefined();
    });
  });

  describe('findAllUserBooks', () => {
    it('should find all user books', async () => {
      // Given
      const userBook1 = new UserBook();
      userBook1.user = testUser;
      userBook1.book = testBook;
      
      const book2 = new Book();
      book2.title = 'Book 2';
      
      const userBook2 = new UserBook();
      userBook2.user = testUser;
      userBook2.book = book2;
      
      await orm.em.persistAndFlush([book2, userBook1, userBook2]);
      orm.em.clear();

      // When
      const result = await service.findAllUserBooks(testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].book.title).toBe('Test Book');
      expect(result[1].book.title).toBe('Book 2');
    });

    it('should return empty array if user has no books', async () => {
      // When
      const result = await service.findAllUserBooks(testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('findUserBookById', () => {
    it('should find a user book by ID', async () => {
      // Given
      const userBook = new UserBook();
      userBook.user = testUser;
      userBook.book = testBook;

      await orm.em.persistAndFlush(userBook);
      orm.em.clear();

      // When
      const result = await service.findUserBookById(userBook.id, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(userBook.id);
      expect(result.user.id).toBe(testUser.id);
      expect(result.book.id).toBe(testBook.id);
    });

    it('should throw NotFoundException if user book not found', async () => {
      // When & Then
      await expect(service.findUserBookById('non-existent-id', testUser.id))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('findUserBooksByStatus', () => {
    it('should find user books by status', async () => {
      // Given
      const userBook1 = new UserBook();
      userBook1.user = testUser;
      userBook1.book = testBook;
      userBook1.status = BookStatus.READING;
      
      const book2 = new Book();
      book2.title = 'Book 2';
      
      const userBook2 = new UserBook();
      userBook2.user = testUser;
      userBook2.book = book2;
      userBook2.status = BookStatus.COMPLETED;
      
      await orm.em.persistAndFlush([book2, userBook1, userBook2]);
      orm.em.clear();

      // When
      const result = await service.findUserBooksByStatus(BookStatus.READING, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].status).toBe(BookStatus.READING);
      expect(result[0].book.title).toBe('Test Book');
    });
  });

  describe('findCompletedUserBooks', () => {
    it('should find completed user books in a date range', async () => {
      // Given
      const userBook1 = new UserBook();
      userBook1.user = testUser;
      userBook1.book = testBook;
      userBook1.status = BookStatus.COMPLETED;
      userBook1.finishedAt = new Date('2023-02-15');
      
      const book2 = new Book();
      book2.title = 'Book 2';
      
      const userBook2 = new UserBook();
      userBook2.user = testUser;
      userBook2.book = book2;
      userBook2.status = BookStatus.COMPLETED;
      userBook2.finishedAt = new Date('2023-08-15');
      
      await orm.em.persistAndFlush([book2, userBook1, userBook2]);
      orm.em.clear();

      // When
      const result = await service.findCompletedUserBooks(
        testUser.id,
        new Date('2023-01-01'),
        new Date('2023-06-30')
      );

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].book.title).toBe('Test Book');
      expect(result[0].finishedAt).toEqual(new Date('2023-02-15'));
    });
  });

  describe('updateUserBook', () => {
    it('should update a user book successfully', async () => {
      // Given
      const userBook = new UserBook();
      userBook.user = testUser;
      userBook.book = testBook;
      userBook.rating = 3.0;
      
      await orm.em.persistAndFlush(userBook);
      orm.em.clear();
      
      const updateData: Partial<UserBook> = {
        rating: 4.5,
        userNotes: 'Great book!',
      };
      
      // When
      const result = await service.updateUserBook(userBook.id, updateData, testUser.id);
      
      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(userBook.id);
      expect(result.rating).toBe(4.5);
      expect(result.userNotes).toBe('Great book!');
    });
    
    it('should throw NotFoundException if user book not found', async () => {
      // When & Then
      await expect(service.updateUserBook('non-existent-id', { rating: 5 }, testUser.id))
        .rejects
        .toThrow(NotFoundException);
    });
  });
  
  describe('updateUserBookStatus', () => {
    it('should update user book status', async () => {
      // Given
      const userBook = new UserBook();
      userBook.user = testUser;
      userBook.book = testBook;
      userBook.status = BookStatus.WANT_TO_READ;
      
      await orm.em.persistAndFlush(userBook);
      orm.em.clear();
      
      // When
      const result = await service.updateUserBookStatus(userBook.id, BookStatus.READING, testUser.id);
      
      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(BookStatus.READING);
      expect(result.startedAt).toBeDefined();
    });
    
    it('should set finishedAt when status changes to COMPLETED', async () => {
      // Given
      const userBook = new UserBook();
      userBook.user = testUser;
      userBook.book = testBook;
      userBook.status = BookStatus.READING;
      userBook.startedAt = new Date('2023-01-01');
      
      await orm.em.persistAndFlush(userBook);
      orm.em.clear();
      
      // When
      const result = await service.updateUserBookStatus(userBook.id, BookStatus.COMPLETED, testUser.id);
      
      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(BookStatus.COMPLETED);
      expect(result.finishedAt).toBeDefined();
      expect(result.startedAt).toEqual(new Date('2023-01-01'));
    });
  });
  
  describe('deleteUserBook', () => {
    it('should delete a user book successfully', async () => {
      // Given
      const userBook = new UserBook();
      userBook.user = testUser;
      userBook.book = testBook;
      
      await orm.em.persistAndFlush(userBook);
      orm.em.clear();
      
      // When
      const result = await service.deleteUserBook(userBook.id, testUser.id);
      
      // Then
      expect(result).toBe(true);
      
      // Verify it was deleted from the database
      const deletedUserBook = await userBookRepository.findOne(userBook.id);
      expect(deletedUserBook).toBeNull();
    });
    
    it('should throw NotFoundException if user book not found', async () => {
      // When & Then
      await expect(service.deleteUserBook('non-existent-id', testUser.id))
        .rejects
        .toThrow(NotFoundException);
    });
  });
  
  describe('deleteAllUserBooks', () => {
    it('should delete all user books for a user', async () => {
      // Given
      const userBook1 = new UserBook();
      userBook1.user = testUser;
      userBook1.book = testBook;
      
      const book2 = new Book();
      book2.title = 'Book 2';
      
      const userBook2 = new UserBook();
      userBook2.user = testUser;
      userBook2.book = book2;
      
      await orm.em.persistAndFlush([book2, userBook1, userBook2]);
      orm.em.clear();
      
      // When
      const result = await service.deleteAllUserBooks(testUser.id);
      
      // Then
      expect(result).toBe(2); // 2 books deleted
      
      // Verify they were deleted from the database
      const remainingUserBooks = await userBookRepository.findByUserId(testUser.id);
      expect(remainingUserBooks.length).toBe(0);
    });
    
    it('should return 0 if user has no books', async () => {
      // When
      const result = await service.deleteAllUserBooks(testUser.id);
      
      // Then
      expect(result).toBe(0);
    });
  });
}); 