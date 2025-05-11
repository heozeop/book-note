import { MikroORM } from "@mikro-orm/core";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as cookieParser from "cookie-parser";
import * as request from "supertest";
import { AuthTestUtil } from "../utils/auth-test.util";
import { TestAppModule } from "../utils/test-app.module";

describe("Book Collections and Tags (e2e)", () => {
  let app: INestApplication;
  let orm: MikroORM;
  let authCookies: string[];
  let userId: string;
  let createdBookId: string;
  let createdCollectionId: string;

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

    // Create a test book for collection/tag tests
    const createBookResponse = await request(app.getHttpServer())
      .post("/books")
      .set("Cookie", authCookies)
      .send({
        title: "Collection Test Book",
        author: "Collection Test Author",
        description: "A test book for collection/tag e2e testing",
      })
      .expect(201);

    createdBookId = createBookResponse.body.book.id;
  });

  afterAll(async () => {
    // Clean up database after tests
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
    await app.close();
  });

  describe("Collections Management", () => {
    it("should create a book collection", async () => {
      const createCollectionDto = {
        name: "Test Collection",
        description: "A test collection for e2e testing",
      };

      const response = await request(app.getHttpServer())
        .post("/collections")
        .set("Cookie", authCookies)
        .send(createCollectionDto)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name", "Test Collection");
      expect(response.body).toHaveProperty("description", "A test collection for e2e testing");

      // Save collection ID for later tests
      createdCollectionId = response.body.id;
    });

    it("should get all user collections", async () => {
      const response = await request(app.getHttpServer())
        .get("/collections")
        .set("Cookie", authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      
      // The response should include our created collection
      const createdCollection = response.body.find(collection => collection.id === createdCollectionId);
      expect(createdCollection).toBeDefined();
      expect(createdCollection).toHaveProperty("name", "Test Collection");
    });

    it("should add a book to a collection", async () => {
      const response = await request(app.getHttpServer())
        .post(`/collections/${createdCollectionId}/books/${createdBookId}`)
        .set("Cookie", authCookies)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);

      // Verify the book is in the collection
      const collectionBooksResponse = await request(app.getHttpServer())
        .get(`/collections/${createdCollectionId}/books`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(Array.isArray(collectionBooksResponse.body)).toBeTruthy();
      expect(collectionBooksResponse.body.length).toBeGreaterThanOrEqual(1);
      
      const bookInCollection = collectionBooksResponse.body.find(book => book.id === createdBookId);
      expect(bookInCollection).toBeDefined();
    });

    it("should remove a book from a collection", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/collections/${createdCollectionId}/books/${createdBookId}`)
        .set("Cookie", authCookies)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);

      // Verify the book is no longer in the collection
      const collectionBooksResponse = await request(app.getHttpServer())
        .get(`/collections/${createdCollectionId}/books`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(Array.isArray(collectionBooksResponse.body)).toBeTruthy();
      const bookInCollection = collectionBooksResponse.body.find(book => book.id === createdBookId);
      expect(bookInCollection).toBeUndefined();
    });

    it("should update a collection", async () => {
      const updateCollectionDto = {
        name: "Updated Collection Name",
        description: "Updated collection description",
      };

      const response = await request(app.getHttpServer())
        .patch(`/collections/${createdCollectionId}`)
        .set("Cookie", authCookies)
        .send(updateCollectionDto)
        .expect(200);

      expect(response.body).toHaveProperty("id", createdCollectionId);
      expect(response.body).toHaveProperty("name", "Updated Collection Name");
      expect(response.body).toHaveProperty("description", "Updated collection description");
    });

    it("should delete a collection", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/collections/${createdCollectionId}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);

      // Verify the collection is no longer accessible
      await request(app.getHttpServer())
        .get(`/collections/${createdCollectionId}`)
        .set("Cookie", authCookies)
        .expect(404);
    });
  });

  describe("Tags Management", () => {
    it("should add tags to a book", async () => {
      const tagData = {
        tags: ["fiction", "testing", "e2e"]
      };

      const response = await request(app.getHttpServer())
        .post(`/books/${createdBookId}/tags`)
        .set("Cookie", authCookies)
        .send(tagData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);

      // Verify the tags were added
      const bookResponse = await request(app.getHttpServer())
        .get(`/books/${createdBookId}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(bookResponse.body).toHaveProperty("tags");
      expect(Array.isArray(bookResponse.body.tags)).toBeTruthy();
      
      const tags = bookResponse.body.tags.map(tag => tag.name);
      expect(tags).toContain("fiction");
      expect(tags).toContain("testing");
      expect(tags).toContain("e2e");
    });

    it("should get all user tags", async () => {
      const response = await request(app.getHttpServer())
        .get("/tags")
        .set("Cookie", authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(3); // We added 3 tags in the previous test
      
      // The response should include our created tags
      const tagNames = response.body.map(tag => tag.name);
      expect(tagNames).toContain("fiction");
      expect(tagNames).toContain("testing");
      expect(tagNames).toContain("e2e");
    });

    it("should get books by tag", async () => {
      const response = await request(app.getHttpServer())
        .get("/books?tag=fiction")
        .set("Cookie", authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      
      // The response might contain the book directly or via a nested book property
      // depending on whether we get a BookResponseDto or UserBookResponseDto
      let taggedBook = response.body.find(book => book.id === createdBookId);
      
      if (!taggedBook) {
        // Try to find by book.id (UserBookResponseDto format)
        taggedBook = response.body.find(userBook => 
          userBook.book && userBook.book.id === createdBookId
        );
      }
      
      expect(taggedBook).toBeDefined();
    });

    it("should remove a tag from a book", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/books/${createdBookId}/tags/fiction`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);

      // Verify the tag was removed
      const bookResponse = await request(app.getHttpServer())
        .get(`/books/${createdBookId}`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(bookResponse.body).toHaveProperty("tags");
      expect(Array.isArray(bookResponse.body.tags)).toBeTruthy();
      
      const tags = bookResponse.body.tags.map(tag => tag.name);
      expect(tags).not.toContain("fiction");
      expect(tags).toContain("testing"); // Other tags should still be there
      expect(tags).toContain("e2e");
    });
  });

  describe("Book Notes", () => {
    it("should add a personal note to a book", async () => {
      const noteData = {
        content: "This is a test note for the book."
      };

      const response = await request(app.getHttpServer())
        .post(`/books/${createdBookId}/notes`)
        .set("Cookie", authCookies)
        .send(noteData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("content", "This is a test note for the book.");
      expect(response.body.book).toHaveProperty("id", createdBookId);
    });

    it("should get all notes for a book", async () => {
      const response = await request(app.getHttpServer())
        .get(`/books/${createdBookId}/notes`)
        .set("Cookie", authCookies)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      
      // The first note should match our created note
      const firstNote = response.body[0];
      expect(firstNote).toHaveProperty("content", "This is a test note for the book.");
    });
  });
}); 