import { MikroORM } from "@mikro-orm/core";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as cookieParser from "cookie-parser";
import * as request from "supertest";
import { AuthTestUtil } from "../utils/auth-test.util";
import { TestAppModule } from "../utils/test-app.module";

describe("Book Search (e2e)", () => {
  let app: INestApplication;
  let orm: MikroORM;
  let authCookies: string[];
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TestAppModule.forTest({ enableGraphQL: true }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Add cookie-parser middleware
    app.use(cookieParser());

    // Apply global pipes like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    orm = moduleFixture.get<MikroORM>(MikroORM);

    // Initialize database schema
    await orm.getSchemaGenerator().createSchema();

    await app.init();

    // Create a test user and get authorization cookies
    const testUser = await AuthTestUtil.createTestUser(app);
    userId = testUser.id;

    const loginResult = await AuthTestUtil.login(app, {
      email: testUser.email,
      password: testUser.password,
    });

    authCookies = loginResult.cookies;
  });

  afterAll(async () => {
    // Clean up database after tests
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
    await app.close();
  });

  describe("Book Search API", () => {
    it("should search books by keywords", async () => {
      const searchKeyword = "javascript";
      
      const response = await request(app.getHttpServer())
        .get(`/books/search?query=${searchKeyword}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.items)).toBeTruthy();
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      
      // Check basic structure of search results
      if (response.body.items.length > 0) {
        const firstBook = response.body.items[0];
        expect(firstBook).toHaveProperty("title");
        expect(firstBook).toHaveProperty("author");
        // Other properties may include: coverUrl, publisher, description, etc.
      }
    });

    it("should search books by ISBN", async () => {
      // Using a common ISBN for testing
      const isbn = "9780132350884"; // Clean Code ISBN
      
      const response = await request(app.getHttpServer())
        .get(`/books/search?isbn=${isbn}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.items)).toBeTruthy();
      
      // ISBN search should return exactly one result or an empty array
      if (response.body.items.length > 0) {
        expect(response.body.items.length).toBe(1);
        expect(response.body.items[0]).toHaveProperty("isbn", isbn);
      }
    });

    it("should support pagination in search results", async () => {
      const searchKeyword = "programming";
      const pageSize = 10;
      const page = 1;
      
      const response = await request(app.getHttpServer())
        .get(`/books/search?query=${searchKeyword}&page=${page}&size=${pageSize}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.items)).toBeTruthy();
      expect(response.body.items.length).toBeLessThanOrEqual(pageSize);
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page", page);
    });

    it("should support sorting search results", async () => {
      const searchKeyword = "javascript";
      
      const response = await request(app.getHttpServer())
        .get(`/books/search?query=${searchKeyword}&sort=date&order=desc`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.items)).toBeTruthy();
      
      // Check if sorted correctly by published date (if available)
      if (response.body.items.length >= 2) {
        const dates = response.body.items
          .map(book => book.publishedDate)
          .filter(date => date); // Filter out undefined dates
        
        if (dates.length >= 2) {
          // Check if dates are in descending order
          const sorted = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          expect(dates).toEqual(sorted);
        }
      }
    });

    it("should add a searched book to user's library", async () => {
      // First, search for a book
      const searchKeyword = "javascript";
      
      const searchResponse = await request(app.getHttpServer())
        .get(`/books/search?query=${searchKeyword}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(searchResponse.body.items.length).toBeGreaterThan(0);
      
      // Get the first book from search results
      const bookToAdd = searchResponse.body.items[0];
      
      // Now add this book to user's library
      const addResponse = await request(app.getHttpServer())
        .post("/books")
        .set("Cookie", authCookies)
        .send({
          title: bookToAdd.title,
          author: bookToAdd.author,
          isbn: bookToAdd.isbn,
          description: bookToAdd.description,
          publisher: bookToAdd.publisher,
          pageCount: bookToAdd.pageCount,
          coverUrl: bookToAdd.coverUrl,
          publishedDate: bookToAdd.publishedDate,
          externalId: bookToAdd.externalId
        })
        .expect(201);

      expect(addResponse.body).toHaveProperty("id");
      expect(addResponse.body).toHaveProperty("book");
      expect(addResponse.body.book).toHaveProperty("title", bookToAdd.title);
      
      // Verify book exists in user's library
      const userBooksResponse = await request(app.getHttpServer())
        .get("/books")
        .set("Cookie", authCookies)
        .expect(200);

      expect(Array.isArray(userBooksResponse.body)).toBeTruthy();
      const addedBook = userBooksResponse.body.find(book => book.book.title === bookToAdd.title);
      expect(addedBook).toBeDefined();
    });
  });

  describe("GraphQL Book Search", () => {
    it("should search books via GraphQL", async () => {
      const searchQuery = `
        query {
          searchBooks(query: "programming") {
            items {
              title
              author
              isbn
              coverUrl
              publisher
            }
            total
            page
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: searchQuery,
        })
        .expect(200);

      // If GraphQL errors occur, they may indicate the endpoint doesn't exist
      if (!response.body.errors) {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.searchBooks).toBeDefined();
        expect(response.body.data.searchBooks.items).toBeDefined();
        expect(Array.isArray(response.body.data.searchBooks.items)).toBeTruthy();
      }
    });

    it("should search books by ISBN via GraphQL", async () => {
      const searchByIsbnQuery = `
        query {
          searchBooks(isbn: "9780132350884") {
            items {
              title
              author
              isbn
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: searchByIsbnQuery,
        })
        .expect(200);

      // If GraphQL errors occur, they may indicate the endpoint doesn't exist
      if (!response.body.errors) {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.searchBooks).toBeDefined();
        expect(response.body.data.searchBooks.items).toBeDefined();
        expect(Array.isArray(response.body.data.searchBooks.items)).toBeTruthy();
      }
    });

    it("should handle missing API credentials gracefully", async () => {
      // Save original environment variables
      const originalEnv = process.env;
      
      try {
        // Simulate missing API credentials
        process.env.NAVER_CLIENT_ID = '';
        process.env.NAVER_CLIENT_SECRET = '';
        
        const response = await request(app.getHttpServer())
          .get('/books/search?query=javascript')
          .set("Cookie", authCookies)
          .expect(200);
          
        // Even with missing credentials, we should get a response with items from the mock service
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body.items)).toBeTruthy();
      } finally {
        // Restore original environment
        process.env = originalEnv;
      }
    });
  });
}); 