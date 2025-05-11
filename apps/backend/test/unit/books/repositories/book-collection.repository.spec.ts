import { MikroORM } from "@mikro-orm/core";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../../../../src/auth/entities/user.entity";
import { BookCollection } from "../../../../src/books/entities/book-collection.entity";
import { Book, BookStatus } from "../../../../src/books/entities/book.entity";
import { Collection } from "../../../../src/books/entities/collection.entity";
import { BookCollectionRepository } from "../../../../src/books/repositories/book-collection.repository";
import { BooksTestModule } from "../books-test.module";

describe('BookCollectionRepository', () => {
  let repository: BookCollectionRepository;
  let orm: MikroORM;
  let testUser: User;
  let testBook: Book;
  let testCollection: Collection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BooksTestModule],
    }).compile();

    repository = module.get<BookCollectionRepository>(BookCollectionRepository);
    orm = module.get<MikroORM>(MikroORM);

    await orm.getSchemaGenerator().createSchema();
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();
    
    // Create test user, book, and collection for each test
    testUser = new User();
    testUser.email = 'test@example.com';
    testUser.passwordHash = 'hashed_password';
    testUser.displayName = 'Test User';
    
    testBook = new Book();
    testBook.title = 'Test Book';
    testBook.author = 'Test Author';
    testBook.status = BookStatus.WANT_TO_READ;
    testBook.owner = testUser;
    
    testCollection = new Collection();
    testCollection.name = 'Test Collection';
    testCollection.owner = testUser;
    
    await orm.em.persistAndFlush([testUser, testBook, testCollection]);
    orm.em.clear();
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByBookId', () => {
    it('should find book-collection relationships by book ID', async () => {
      // Given
      const collection1 = new Collection();
      collection1.name = 'Collection 1';
      collection1.owner = testUser;
      
      const collection2 = new Collection();
      collection2.name = 'Collection 2';
      collection2.owner = testUser;
      
      await orm.em.persistAndFlush([collection1, collection2]);

      const bookCollection1 = new BookCollection();
      bookCollection1.book = testBook;
      bookCollection1.collection = collection1;
      
      const bookCollection2 = new BookCollection();
      bookCollection2.book = testBook;
      bookCollection2.collection = collection2;
      
      await orm.em.persistAndFlush([bookCollection1, bookCollection2]);
      orm.em.clear();

      // When
      const result = await repository.findByBookId(testBook.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].collection.id).toBe(collection1.id);
      expect(result[1].collection.id).toBe(collection2.id);
    });

    it('should return empty array if book has no collections', async () => {
      // When
      const result = await repository.findByBookId(testBook.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('findByCollectionId', () => {
    it('should find book-collection relationships by collection ID', async () => {
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

      const bookCollection1 = new BookCollection();
      bookCollection1.book = book1;
      bookCollection1.collection = testCollection;
      
      const bookCollection2 = new BookCollection();
      bookCollection2.book = book2;
      bookCollection2.collection = testCollection;
      
      await orm.em.persistAndFlush([bookCollection1, bookCollection2]);
      orm.em.clear();

      // When
      const result = await repository.findByCollectionId(testCollection.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].book.id).toBe(book1.id);
      expect(result[1].book.id).toBe(book2.id);
    });

    it('should return empty array if collection has no books', async () => {
      // When
      const result = await repository.findByCollectionId(testCollection.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('findByBookIdAndCollectionId', () => {
    it('should find a specific book-collection relationship', async () => {
      // Given
      const bookCollection = new BookCollection();
      bookCollection.book = testBook;
      bookCollection.collection = testCollection;
      bookCollection.order = 1;
      
      await orm.em.persistAndFlush(bookCollection);
      orm.em.clear();

      // When
      const result = await repository.findByBookIdAndCollectionId(
        testBook.id, 
        testCollection.id
      );

      // Then
      expect(result).toBeDefined();
      expect(result?.book.id).toBe(testBook.id);
      expect(result?.collection.id).toBe(testCollection.id);
      expect(result?.order).toBe(1);
    });

    it('should return null if relationship does not exist', async () => {
      // When
      const result = await repository.findByBookIdAndCollectionId(
        testBook.id, 
        testCollection.id
      );

      // Then
      expect(result).toBeNull();
    });
  });

  describe('removeBookFromCollection', () => {
    it('should remove a book from a collection', async () => {
      // Given
      const bookCollection = new BookCollection();
      bookCollection.book = testBook;
      bookCollection.collection = testCollection;
      
      await orm.em.persistAndFlush(bookCollection);
      orm.em.clear();

      // When
      const removeResult = await repository.removeBookFromCollection(
        testBook.id, 
        testCollection.id
      );
      const checkRelationship = await repository.findByBookIdAndCollectionId(
        testBook.id, 
        testCollection.id
      );

      // Then
      expect(removeResult).toBe(1); // 1 row affected
      expect(checkRelationship).toBeNull();
    });

    it('should return 0 if relationship does not exist', async () => {
      // When
      const result = await repository.removeBookFromCollection(
        testBook.id, 
        testCollection.id
      );

      // Then
      expect(result).toBe(0); // 0 rows affected
    });
  });

  describe('removeAllCollectionsForBook', () => {
    it('should remove all collection relationships for a book', async () => {
      // Given
      const collection1 = new Collection();
      collection1.name = 'Collection 1';
      collection1.owner = testUser;
      
      const collection2 = new Collection();
      collection2.name = 'Collection 2';
      collection2.owner = testUser;
      
      await orm.em.persistAndFlush([collection1, collection2]);

      const bookCollection1 = new BookCollection();
      bookCollection1.book = testBook;
      bookCollection1.collection = collection1;
      
      const bookCollection2 = new BookCollection();
      bookCollection2.book = testBook;
      bookCollection2.collection = collection2;
      
      await orm.em.persistAndFlush([bookCollection1, bookCollection2]);
      orm.em.clear();

      // When
      const removeResult = await repository.removeAllCollectionsForBook(testBook.id);
      const remainingRelationships = await repository.findByBookId(testBook.id);

      // Then
      expect(removeResult).toBe(2); // 2 rows affected
      expect(remainingRelationships.length).toBe(0);
    });

    it('should return 0 if book has no collections', async () => {
      // When
      const result = await repository.removeAllCollectionsForBook(testBook.id);

      // Then
      expect(result).toBe(0); // 0 rows affected
    });
  });

  describe('removeAllBooksFromCollection', () => {
    it('should remove all book relationships from a collection', async () => {
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

      const bookCollection1 = new BookCollection();
      bookCollection1.book = book1;
      bookCollection1.collection = testCollection;
      
      const bookCollection2 = new BookCollection();
      bookCollection2.book = book2;
      bookCollection2.collection = testCollection;
      
      await orm.em.persistAndFlush([bookCollection1, bookCollection2]);
      orm.em.clear();

      // When
      const removeResult = await repository.removeAllBooksFromCollection(testCollection.id);
      const remainingRelationships = await repository.findByCollectionId(testCollection.id);

      // Then
      expect(removeResult).toBe(2); // 2 rows affected
      expect(remainingRelationships.length).toBe(0);
    });

    it('should return 0 if collection has no books', async () => {
      // When
      const result = await repository.removeAllBooksFromCollection(testCollection.id);

      // Then
      expect(result).toBe(0); // 0 rows affected
    });
  });
}); 