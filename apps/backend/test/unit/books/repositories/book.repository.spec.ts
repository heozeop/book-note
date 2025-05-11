import { MikroORM } from "@mikro-orm/core";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../../../../src/auth/entities/user.entity";
import { BookCollection } from "../../../../src/books/entities/book-collection.entity";
import { Book, BookStatus } from "../../../../src/books/entities/book.entity";
import { Collection } from "../../../../src/books/entities/collection.entity";
import { BookRepository } from "../../../../src/books/repositories/book.repository";
import { BooksTestModule } from "../books-test.module";

describe('BookRepository', () => {
  let repository: BookRepository;
  let orm: MikroORM;
  let testUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BooksTestModule],
    }).compile();

    repository = module.get<BookRepository>(BookRepository);
    orm = module.get<MikroORM>(MikroORM);

    await orm.getSchemaGenerator().createSchema();
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();
    
    // Create a test user for each test
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
    expect(repository).toBeDefined();
  });

  describe('findByOwnerId', () => {
    it('should find books by owner ID', async () => {
      // Given
      const book1 = new Book();
      book1.title = 'Book 1';
      book1.author = 'Author 1';
      book1.status = BookStatus.WANT_TO_READ;
      book1.owner = testUser;

      const book2 = new Book();
      book2.title = 'Book 2';
      book2.author = 'Author 2';
      book2.status = BookStatus.READING;
      book2.owner = testUser;

      await orm.em.persistAndFlush([book1, book2]);
      orm.em.clear();

      // When
      const result = await repository.findByOwnerId(testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Book 1');
      expect(result[1].title).toBe('Book 2');
    });

    it('should return empty array if user has no books', async () => {
      // When
      const result = await repository.findByOwnerId(testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('findByIdAndOwnerId', () => {
    it('should find a book by ID and owner ID', async () => {
      // Given
      const book = new Book();
      book.title = 'Test Book';
      book.author = 'Test Author';
      book.status = BookStatus.WANT_TO_READ;
      book.owner = testUser;

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      // When
      const result = await repository.findByIdAndOwnerId(book.id, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result?.title).toBe('Test Book');
      expect(result?.owner.id).toBe(testUser.id);
    });

    it('should return null if book not found', async () => {
      // When
      const result = await repository.findByIdAndOwnerId('non-existent-id', testUser.id);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should find books by status and owner ID', async () => {
      // Given
      const book1 = new Book();
      book1.title = 'Reading Book 1';
      book1.author = 'Author 1';
      book1.status = BookStatus.READING;
      book1.owner = testUser;

      const book2 = new Book();
      book2.title = 'Reading Book 2';
      book2.author = 'Author 2';
      book2.status = BookStatus.READING;
      book2.owner = testUser;

      const book3 = new Book();
      book3.title = 'Completed Book';
      book3.author = 'Author 3';
      book3.status = BookStatus.COMPLETED;
      book3.owner = testUser;

      await orm.em.persistAndFlush([book1, book2, book3]);
      orm.em.clear();

      // When
      const result = await repository.findByStatus(BookStatus.READING, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Reading Book 1');
      expect(result[1].title).toBe('Reading Book 2');
    });

    it('should return empty array if no books with specified status', async () => {
      // Given
      const book = new Book();
      book.title = 'Test Book';
      book.author = 'Test Author';
      book.status = BookStatus.WANT_TO_READ;
      book.owner = testUser;

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      // When
      const result = await repository.findByStatus(BookStatus.COMPLETED, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('findCompletedBetweenDates', () => {
    it('should find completed books between specific dates', async () => {
      // Given
      const pastDate = new Date('2023-01-01');
      const middleDate = new Date('2023-06-15');
      const futureDate = new Date('2023-12-31');
      
      const book1 = new Book();
      book1.title = 'Early Book';
      book1.author = 'Author 1';
      book1.status = BookStatus.COMPLETED;
      book1.finishedAt = new Date('2023-03-15');
      book1.owner = testUser;

      const book2 = new Book();
      book2.title = 'Middle Book';
      book2.author = 'Author 2';
      book2.status = BookStatus.COMPLETED;
      book2.finishedAt = new Date('2023-06-15');
      book2.owner = testUser;

      const book3 = new Book();
      book3.title = 'Late Book';
      book3.author = 'Author 3';
      book3.status = BookStatus.COMPLETED;
      book3.finishedAt = new Date('2023-09-15');
      book3.owner = testUser;

      await orm.em.persistAndFlush([book1, book2, book3]);
      orm.em.clear();

      // When - Find books completed between pastDate and middleDate
      const result = await repository.findCompletedBetweenDates(
        testUser.id,
        pastDate,
        middleDate
      );

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result.some(book => book.title === 'Early Book')).toBe(true);
      expect(result.some(book => book.title === 'Middle Book')).toBe(true);
      expect(result.some(book => book.title === 'Late Book')).toBe(false);
    });

    it('should return empty array if no books completed in the date range', async () => {
      // Given
      const book = new Book();
      book.title = 'Test Book';
      book.author = 'Test Author';
      book.status = BookStatus.COMPLETED;
      book.finishedAt = new Date('2023-05-15');
      book.owner = testUser;

      await orm.em.persistAndFlush(book);
      orm.em.clear();

      // When - Search for books in a different date range
      const result = await repository.findCompletedBetweenDates(
        testUser.id,
        new Date('2023-06-01'),
        new Date('2023-07-01')
      );

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('bookCollections relationship', () => {
    it('should properly load books with their collection relationships', async () => {
      // Given
      const book = new Book();
      book.title = 'Test Book';
      book.author = 'Test Author';
      book.owner = testUser;
      
      const collection1 = new Collection();
      collection1.name = 'Collection 1';
      collection1.owner = testUser;
      
      const collection2 = new Collection();
      collection2.name = 'Collection 2';
      collection2.owner = testUser;
      
      await orm.em.persistAndFlush([book, collection1, collection2]);
      
      const bookCollection1 = new BookCollection();
      bookCollection1.book = book;
      bookCollection1.collection = collection1;
      
      const bookCollection2 = new BookCollection();
      bookCollection2.book = book;
      bookCollection2.collection = collection2;
      
      await orm.em.persistAndFlush([bookCollection1, bookCollection2]);
      orm.em.clear();

      // When - Find the book with its relationships
      const result = await repository.findOne(book.id, {
        populate: ['bookCollections.collection']
      });

      // Then
      expect(result).toBeDefined();
      expect(result?.bookCollections.count()).toBe(2);
      
      const collectionNames = result?.bookCollections.getItems().map(
        bc => bc.collection.name
      );
      
      expect(collectionNames).toContain('Collection 1');
      expect(collectionNames).toContain('Collection 2');
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

      // When
      const updateData = { 
        title: 'New Title', 
        author: 'New Author',
        status: BookStatus.READING
      };
      
      const updateResult = await repository.updateBook(book.id, updateData);
      const updatedBook = await repository.findOne(book.id);

      // Then
      expect(updateResult).toBe(1); // 1 row affected
      expect(updatedBook).toBeDefined();
      expect(updatedBook?.title).toBe('New Title');
      expect(updatedBook?.author).toBe('New Author');
      expect(updatedBook?.status).toBe(BookStatus.READING);
    });

    it('should return 0 if no book found to update', async () => {
      // When
      const updateData = { title: 'New Title' };
      const result = await repository.updateBook('non-existent-id', updateData);

      // Then
      expect(result).toBe(0); // 0 rows affected
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
      const deleteResult = await repository.deleteBook(book.id);
      const checkBook = await repository.findOne(book.id);

      // Then
      expect(deleteResult).toBe(1); // 1 row affected
      expect(checkBook).toBeNull();
    });

    it('should return 0 if no book found to delete', async () => {
      // When
      const result = await repository.deleteBook('non-existent-id');

      // Then
      expect(result).toBe(0); // 0 rows affected
    });
  });

  describe('deleteAllBooksByOwnerId', () => {
    it('should delete all books belonging to a user', async () => {
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
      const deleteResult = await repository.deleteAllBooksByOwnerId(testUser.id);
      const remainingBooks = await repository.findByOwnerId(testUser.id);

      // Then
      expect(deleteResult).toBe(2); // 2 rows affected
      expect(remainingBooks.length).toBe(0);
    });

    it('should return 0 if user has no books', async () => {
      // When
      const result = await repository.deleteAllBooksByOwnerId(testUser.id);

      // Then
      expect(result).toBe(0); // 0 rows affected
    });
  });
}); 