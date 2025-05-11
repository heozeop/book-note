import { MikroORM } from "@mikro-orm/core";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as cookieParser from "cookie-parser";
import * as request from "supertest";
import { BookStatus } from "../../../src/books/entities/reading-status.entity";
import { AuthTestUtil } from "../utils/auth-test.util";
import { TestAppModule } from "../utils/test-app.module";

describe("Books GraphQL (e2e)", () => {
  let app: INestApplication;
  let orm: MikroORM;
  let authCookies: string[];
  let userId: string;
  let createdBookId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TestAppModule.forTest({ enableGraphQL: true }), // Enable GraphQL for this test
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
    await orm.getSchemaGenerator().refreshDatabase();

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

  describe("Book GraphQL Operations", () => {
    it("should create a new book via GraphQL", async () => {
      const createBookMutation = `
        mutation {
          createBook(input: {
            title: "GraphQL Test Book",
            author: "GraphQL Author",
            isbn: "9781234567897",
            description: "A test book for GraphQL testing",
            publisher: "Test Publisher",
            pageCount: 300
          }) {
            id
            book {
              id
              title
              author
              isbn
              description
            }
            status
            startedAt
            finishedAt
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: createBookMutation,
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.createBook).toBeDefined();
      expect(response.body.data.createBook.id).toBeDefined();
      expect(response.body.data.createBook.book.title).toBe("GraphQL Test Book");
      expect(response.body.data.createBook.book.author).toBe("GraphQL Author");
      expect(response.body.data.createBook.status).toBe(BookStatus.WANT_TO_READ);

      // Save book ID for later tests
      createdBookId = response.body.data.createBook.id;
    });

    it("should get all books via GraphQL", async () => {
      const getBooksQuery = `
        query {
          books {
            id
            book {
              id
              title
              author
            }
            status
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: getBooksQuery,
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.books).toBeDefined();
      expect(Array.isArray(response.body.data.books)).toBeTruthy();
      expect(response.body.data.books.length).toBeGreaterThanOrEqual(1);

      // The list should include our created book
      const createdBook = response.body.data.books.find(book => book.id === createdBookId);
      expect(createdBook).toBeDefined();
      expect(createdBook.book.title).toBe("GraphQL Test Book");
    });

    it("should filter books by status via GraphQL", async () => {
      const getBooksWithStatusQuery = `
        query {
          books(status: "want_to_read") {
            id
            book {
              id
              title
            }
            status
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: getBooksWithStatusQuery,
        });
      
      console.log("Filter by status GraphQL response:", response.status, JSON.stringify(response.body));
      
      expect(response.status).toBe(200);
      
      if (response.status === 200) {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.books).toBeDefined();
        expect(Array.isArray(response.body.data.books)).toBeTruthy();
        
        // All books should have the requested status
        for (const book of response.body.data.books) {
          expect(book.status).toBe(BookStatus.WANT_TO_READ);
        }
      }
    });

    it("should get a specific book by ID via GraphQL", async () => {
      const getBookQuery = `
        query {
          book(id: "${createdBookId}") {
            id
            book {
              id
              title
              author
              description
            }
            status
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: getBookQuery,
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.book).toBeDefined();
      expect(response.body.data.book.id).toBe(createdBookId);
      expect(response.body.data.book.book.title).toBe("GraphQL Test Book");
      expect(response.body.data.book.book.author).toBe("GraphQL Author");
    });

    it("should update a book via GraphQL", async () => {
      const updateBookMutation = `
        mutation {
          updateBook(
            id: "${createdBookId}",
            input: {
              title: "Updated GraphQL Book",
              description: "Updated description for GraphQL testing"
            }
          ) {
            id
            book {
              id
              title
              author
              description
            }
            status
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: updateBookMutation,
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updateBook).toBeDefined();
      expect(response.body.data.updateBook.id).toBe(createdBookId);
      expect(response.body.data.updateBook.book.title).toBe("Updated GraphQL Book");
      expect(response.body.data.updateBook.book.description).toBe("Updated description for GraphQL testing");
      // Original fields should remain unchanged
      expect(response.body.data.updateBook.book.author).toBe("GraphQL Author");
    });

    it("should update a book's status via GraphQL", async () => {
      const updateStatusMutation = `
        mutation {
          updateBookStatus(
            id: "${createdBookId}",
            status: "reading"
          ) {
            id
            book {
              id
              title
            }
            status
            startedAt
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: updateStatusMutation,
        });
      
      console.log("Update status GraphQL response:", response.status, JSON.stringify(response.body));
      
      expect(response.status).toBe(200);
      
      if (response.status === 200) {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.updateBookStatus).toBeDefined();
        expect(response.body.data.updateBookStatus.id).toBe(createdBookId);
        expect(response.body.data.updateBookStatus.status).toBe(BookStatus.READING);
        expect(response.body.data.updateBookStatus.startedAt).toBeDefined();
      }
    });

    it("should support book search via GraphQL", async () => {
      const searchBooksQuery = `
        query {
          searchBooks(query: "GraphQL") {
            total
            items {
              title
              author
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: searchBooksQuery,
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.searchBooks).toBeDefined();
      expect(response.body.data.searchBooks.total).toBeDefined();
      expect(response.body.data.searchBooks.items).toBeDefined();
    });

    // Test for real-time data synchronization across devices
    it("should support data synchronization across devices", async () => {
      // Create a second user to simulate another device
      const secondUser = await AuthTestUtil.createTestUser(app, {
        email: "graphql-second@example.com",
        password: "StrongP@ssword789!", // Use a strong password that meets requirements
      });
      
      const secondLoginResult = await AuthTestUtil.login(app, {
        email: secondUser.email,
        password: "StrongP@ssword789!", // Use the same strong password
      });
      
      const secondAuthCookies = secondLoginResult.cookies;
      
      // Create book with first user
      const createBookMutation = `
        mutation {
          createBook(input: {
            title: "Sync GraphQL Book",
            author: "Sync Author"
          }) {
            id
            book {
              id
              title
            }
          }
        }
      `;
      
      const createResponse = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: createBookMutation,
        });
      
      const syncBookId = createResponse.body.data.createBook.id;
      
      // Update the book with second user
      const updateBookMutation = `
        mutation {
          updateBook(
            id: "${syncBookId}",
            input: {
              description: "Updated via GraphQL from second device"
            }
          ) {
            id
            book {
              id
              description
            }
          }
        }
      `;
      
      await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", secondAuthCookies)
        .send({
          query: updateBookMutation,
        });
      
      // Check if first user can see the changes
      const getBookQuery = `
        query {
          book(id: "${syncBookId}") {
            id
            book {
              id
              title
              description
            }
          }
        }
      `;
      
      const checkResponse = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: getBookQuery,
        });
      
      expect(checkResponse.body.data.book.book.description).toBe("Updated via GraphQL from second device");
    });

    it("should delete a book via GraphQL", async () => {
      const deleteBookMutation = `
        mutation {
          deleteBook(id: "${createdBookId}")
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: deleteBookMutation,
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.deleteBook).toBe(true);

      // Verify the book is no longer accessible
      const getDeletedBookQuery = `
        query {
          book(id: "${createdBookId}") {
            id
          }
        }
      `;

      const verifyResponse = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: getDeletedBookQuery,
        });

      expect(verifyResponse.body.errors).toBeDefined();
      // Not found error message could be in different languages - just check for existence
      expect(verifyResponse.body.errors[0].message).toBeTruthy();
    });
  });

  describe("Error Handling in GraphQL", () => {
    it("should handle non-existent book error", async () => {
      const getNonExistentBookQuery = `
        query {
          book(id: "non-existent-id") {
            id
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: getNonExistentBookQuery,
        });

      expect(response.body.errors).toBeDefined();
      // Not found error message could be in different languages - just check for existence
      expect(response.body.errors[0].message).toBeTruthy();
    });

    it("should validate input in GraphQL mutations", async () => {
      const invalidBookMutation = `
        mutation {
          createBook(input: {
            # Missing required title
            author: "Invalid Author",
            pageCount: -10 # Invalid negative value
          }) {
            id
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("Cookie", authCookies)
        .send({
          query: invalidBookMutation,
        });

      expect(response.body.errors).toBeDefined();
    });

    it("should require authentication for GraphQL operations", async () => {
      const getBooksQuery = `
        query {
          books {
            id
          }
        }
      `;

      // Try without auth cookies
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: getBooksQuery,
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain("인증");
    });
  });
}); 