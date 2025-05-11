import { MikroORM } from "@mikro-orm/core";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as cookieParser from "cookie-parser";
import * as request from "supertest";
import { CreateBookDto } from "../../../src/books/dtos/create-book.dto";
import { UpdateBookDto } from "../../../src/books/dtos/update-book.dto";
import { BookStatus } from "../../../src/books/entities/book.entity";
import { AuthTestUtil } from "../utils/auth-test.util";
import { TestAppModule } from "../utils/test-app.module";

describe("Books (e2e)", () => {
  let app: INestApplication;
  let orm: MikroORM;
  let authCookies: string[];
  let userId: string;
  let createdBookId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TestAppModule.forTest(), // Include auth module
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

  describe("Book CRUD Operations", () => {
    it("should create a new book", async () => {
      const createBookDto: CreateBookDto = {
        title: "Test Book",
        author: "Test Author",
        isbn: "9781234567897",
        description: "A test book for e2e testing",
        publisher: "Test Publisher",
        totalPages: 300,
        status: BookStatus.WANT_TO_READ,
      };

      const response = await request(app.getHttpServer())
        .post("/books")
        .set("Cookie", authCookies)
        .send(createBookDto)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("title", "Test Book");
      expect(response.body).toHaveProperty("author", "Test Author");
      expect(response.body).toHaveProperty("status", BookStatus.WANT_TO_READ);

      // Save book ID for later tests
      createdBookId = response.body.id;
    });

    it("should get all books for the user", async () => {
      const response = await request(app.getHttpServer())
        .get("/books")
        .set("Cookie", authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      
      // The first book should match our created book
      const firstBook = response.body[0];
      expect(firstBook).toHaveProperty("id", createdBookId);
      expect(firstBook).toHaveProperty("title", "Test Book");
    });

    it("should filter books by status", async () => {
      const response = await request(app.getHttpServer())
        .get(`/books?status=${BookStatus.WANT_TO_READ}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      
      // All books should have the requested status
      for (const book of response.body) {
        expect(book.status).toBe(BookStatus.WANT_TO_READ);
      }
    });

    it("should get a specific book by ID", async () => {
      const response = await request(app.getHttpServer())
        .get(`/books/${createdBookId}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(response.body).toHaveProperty("id", createdBookId);
      expect(response.body).toHaveProperty("title", "Test Book");
      expect(response.body).toHaveProperty("author", "Test Author");
    });

    it("should update a book", async () => {
      const updateBookDto: UpdateBookDto = {
        title: "Updated Book Title",
        description: "Updated description for e2e testing",
      };

      const response = await request(app.getHttpServer())
        .patch(`/books/${createdBookId}`)
        .set("Cookie", authCookies)
        .send(updateBookDto)
        .expect(200);

      expect(response.body).toHaveProperty("id", createdBookId);
      expect(response.body).toHaveProperty("title", "Updated Book Title");
      expect(response.body).toHaveProperty("description", "Updated description for e2e testing");
      // Original fields should remain unchanged
      expect(response.body).toHaveProperty("author", "Test Author");
    });

    it("should update a book's status", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/books/${createdBookId}/status?status=${BookStatus.READING}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(response.body).toHaveProperty("id", createdBookId);
      expect(response.body).toHaveProperty("status", BookStatus.READING);
      expect(response.body).toHaveProperty("startedAt");
    });

    it("should get completed books with date range", async () => {
      // First, create a book
      const createBookDto: CreateBookDto = {
        title: "Completed Test Book",
        author: "Completed Author",
      };

      const createResponse = await request(app.getHttpServer())
        .post("/books")
        .set("Cookie", authCookies)
        .send(createBookDto)
        .expect(201);

      const completedBookId = createResponse.body.id;
      
      // Then update its status to COMPLETED
      await request(app.getHttpServer())
        .patch(`/books/${completedBookId}/status?status=${BookStatus.COMPLETED}`)
        .set("Cookie", authCookies)
        .expect(200);

      // Get the date range for testing (last 30 days)
      const startDateStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
      const endDateStr = new Date().toISOString(); // Now

      // Now test the completed books endpoint
      const response = await request(app.getHttpServer())
        .get(`/books/completed?startDate=${startDateStr}&endDate=${endDateStr}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      
      // The response should include our completed book
      const includedBook = response.body.find(book => book.id === completedBookId);
      expect(includedBook).toBeDefined();
      expect(includedBook).toHaveProperty("title", "Completed Test Book");
      expect(includedBook).toHaveProperty("status", BookStatus.COMPLETED);
      expect(includedBook).toHaveProperty("finishedAt");
    });

    it("should delete a book", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/books/${createdBookId}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);

      // Verify the book is no longer accessible
      await request(app.getHttpServer())
        .get(`/books/${createdBookId}`)
        .set("Cookie", authCookies)
        .expect(404);
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent book", async () => {
      await request(app.getHttpServer())
        .get(`/books/non-existent-id`)
        .set("Cookie", authCookies)
        .expect(404);
    });

    it("should validate input when creating a book", async () => {
      const invalidBookDto = {
        // Missing required title
        author: "Test Author",
        totalPages: -10, // Invalid negative value
      };

      await request(app.getHttpServer())
        .post("/books")
        .set("Cookie", authCookies)
        .send(invalidBookDto)
        .expect(400);
    });

    it("should require authentication for all endpoints", async () => {
      // Try without auth cookies
      await request(app.getHttpServer())
        .get("/books")
        .expect(401);
    });
  });
}); 