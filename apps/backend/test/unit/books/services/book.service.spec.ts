import { MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../../src/auth/entities/user.entity';
import { CreateBookDto } from '../../../../src/books/dtos/create-book.dto';
import { UpdateBookDto } from '../../../../src/books/dtos/update-book.dto';
import { Book, BookStatus } from '../../../../src/books/entities/book.entity';
import { BookRepository } from '../../../../src/books/repositories/book.repository';
import { BookService } from '../../../../src/books/services/book.service';
import { BooksTestModule } from '../books-test.module';

describe('BookService', () => {
  let service: BookService;
  let repository: BookRepository;
  let orm: MikroORM;
  let testUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BooksTestModule],
    }).compile();

    service = module.get<BookService>(BookService);
    repository = module.get<BookRepository>(BookRepository);
    orm = module.get<MikroORM>(MikroORM);

    await orm.getSchemaGenerator().createSchema();
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();
    
    testUser = new User();
    testUser.email = 'test@example.com';
    testUser.passwordHash = 'hashed_password';
    testUser.displayName = 'Test User';
    
    await orm.em.persistAndFlush(testUser);
    orm.em.clear();
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      // Given
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '9781234567897',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test book description',
        publisher: 'Test Publisher',
        publishedDate: new Date('2023-01-01'),
        totalPages: 300,
        status: BookStatus.WANT_TO_READ,
        metadata: { genre: 'Fiction', tags: ['test', 'fantasy'] },
      };

      // When
      const result = await service.createBook(createBookDto, testUser);

      // Then
      expect(result).toBeDefined();
      expect(result.title).toBe('Test Book');
      expect(result.author).toBe('Test Author');
      expect(result.isbn).toBe('9781234567897');
      expect(result.status).toBe(BookStatus.WANT_TO_READ);
      expect(result.owner.id).toBe(testUser.id);
      
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
      const result = await service.createBook(createBookDto, testUser);

      // Then
      expect(result).toBeDefined();
      expect(result.title).toBe('Minimal Book');
      expect(result.author).toBeUndefined();
      expect(result.status).toBe(BookStatus.WANT_TO_READ); // Default status
      expect(result.owner.id).toBe(testUser.id);
    });
  });

  describe('findAllBooks', () => {
    it('should find all books for a user', async () => {
      // Given
      const book1 = new Book();
      book1.title = 'Book 1';
      book1.author = 'Author 1';
      book1.owner = testUser;

      const book2 = new Book();
      book2.title = 'Book 2';
      book2.author = 'Author 2';
      book2.owner = testUser;

      await orm.em.persistAndFlush([book1, book2]);
      orm.em.clear();

      // When
      const result = await service.findAllBooks(testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Book 1');
      expect(result[1].title).toBe('Book 2');
    });

    it('should return empty array if user has no books', async () => {
      // When
      const result = await service.findAllBooks(testUser.id);

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
      book.owner = testUser;

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      // When
      const result = await service.findBookById(book.id, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(book.id);
      expect(result.title).toBe('Test Book');
      expect(result.owner.id).toBe(testUser.id);
    });

    it('should throw NotFoundException if book not found', async () => {
      // When & Then
      await expect(service.findBookById('non-existent-id', testUser.id))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('findBooksByStatus', () => {
    it('should find books by status', async () => {
      // Given
      const book1 = new Book();
      book1.title = 'Reading Book';
      book1.author = 'Author 1';
      book1.status = BookStatus.READING;
      book1.owner = testUser;

      const book2 = new Book();
      book2.title = 'Completed Book';
      book2.author = 'Author 2';
      book2.status = BookStatus.COMPLETED;
      book2.owner = testUser;

      await orm.em.persistAndFlush([book1, book2]);
      orm.em.clear();

      // When
      const result = await service.findBooksByStatus(BookStatus.READING, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Reading Book');
      expect(result[0].status).toBe(BookStatus.READING);
    });

    it('should return empty array if no books with specified status', async () => {
      // Given
      const book = new Book();
      book.title = 'Reading Book';
      book.author = 'Test Author';
      book.status = BookStatus.READING;
      book.owner = testUser;

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      // When
      const result = await service.findBooksByStatus(BookStatus.COMPLETED, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('findCompletedBooks', () => {
    it('should find completed books in a date range', async () => {
      // Given
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-06-30');
      
      const book1 = new Book();
      book1.title = 'Early Completed Book';
      book1.author = 'Author 1';
      book1.status = BookStatus.COMPLETED;
      book1.finishedAt = new Date('2023-02-15');
      book1.owner = testUser;

      const book2 = new Book();
      book2.title = 'Late Completed Book';
      book2.author = 'Author 2';
      book2.status = BookStatus.COMPLETED;
      book2.finishedAt = new Date('2023-08-15');
      book2.owner = testUser;

      await orm.em.persistAndFlush([book1, book2]);
      orm.em.clear();

      // When
      const result = await service.findCompletedBooks(testUser.id, startDate, endDate);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Early Completed Book');
    });

    it('should return empty array if no completed books in the date range', async () => {
      // When
      const result = await service.findCompletedBooks(
        testUser.id,
        new Date('2023-01-01'),
        new Date('2023-12-31')
      );

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('updateBook', () => {
    it('should update a book', async () => {
      // Given
      const book = new Book();
      book.title = 'Old Title';
      book.author = 'Old Author';
      book.status = BookStatus.WANT_TO_READ;
      book.owner = testUser;

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      const updateBookDto: UpdateBookDto = {
        title: 'New Title',
        author: 'New Author',
        description: 'Updated description',
      };

      // When
      const result = await service.updateBook(book.id, updateBookDto, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(book.id);
      expect(result.title).toBe('New Title');
      expect(result.author).toBe('New Author');
      expect(result.description).toBe('Updated description');
      expect(result.status).toBe(BookStatus.WANT_TO_READ); // Status should not change
    });

    it('should set startedAt when status changes to READING', async () => {
      // Given
      const book = new Book();
      book.title = 'Test Book';
      book.author = 'Test Author';
      book.status = BookStatus.WANT_TO_READ;
      book.owner = testUser;

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      const updateBookDto: UpdateBookDto = {
        status: BookStatus.READING,
      };

      // When
      const result = await service.updateBook(book.id, updateBookDto, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(BookStatus.READING);
      expect(result.startedAt).toBeDefined();
    });

    it('should set finishedAt when status changes to COMPLETED', async () => {
      // Given
      const book = new Book();
      book.title = 'Test Book';
      book.author = 'Test Author';
      book.status = BookStatus.READING;
      book.startedAt = new Date('2023-01-01');
      book.owner = testUser;

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      const updateBookDto: UpdateBookDto = {
        status: BookStatus.COMPLETED,
      };

      // When
      const result = await service.updateBook(book.id, updateBookDto, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(BookStatus.COMPLETED);
      expect(result.finishedAt).toBeDefined();
    });

    it('should throw NotFoundException if book not found', async () => {
      // Given
      const updateBookDto: UpdateBookDto = {
        title: 'New Title',
      };

      // When & Then
      await expect(service.updateBook('non-existent-id', updateBookDto, testUser.id))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('updateBookStatus', () => {
    it('should update book status', async () => {
      // Given
      const book = new Book();
      book.title = 'Test Book';
      book.author = 'Test Author';
      book.status = BookStatus.WANT_TO_READ;
      book.owner = testUser;

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      // When
      const result = await service.updateBookStatus(book.id, BookStatus.READING, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(BookStatus.READING);
      expect(result.startedAt).toBeDefined();
    });
  });

  describe('deleteBook', () => {
    it('should delete a book', async () => {
      // Given
      const book = new Book();
      book.title = 'Book to Delete';
      book.author = 'Test Author';
      book.owner = testUser;

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      // When
      const result = await service.deleteBook(book.id, testUser.id);
      expect(result).toBe(true);


      // Then
      await expect(service.findBookById(book.id, testUser.id))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException if book not found', async () => {
      // When & Then
      await expect(service.deleteBook('non-existent-id', testUser.id))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('deleteAllUserBooks', () => {
    it('should delete all books for a user', async () => {
      // Given
      const book1 = new Book();
      book1.title = 'Book 1';
      book1.author = 'Author 1';
      book1.owner = testUser;

      const book2 = new Book();
      book2.title = 'Book 2';
      book2.author = 'Author 2';
      book2.owner = testUser;

      await orm.em.persistAndFlush([book1, book2]);
      orm.em.clear();

      // When
      const result = await service.deleteAllUserBooks(testUser.id);
      const remainingBooks = await repository.findByOwnerId(testUser.id);

      // Then
      expect(result).toBe(2); // 2 books deleted
      expect(remainingBooks.length).toBe(0);
    });

    it('should return 0 if user has no books', async () => {
      // When
      const result = await service.deleteAllUserBooks(testUser.id);

      // Then
      expect(result).toBe(0);
    });
  });
}); 