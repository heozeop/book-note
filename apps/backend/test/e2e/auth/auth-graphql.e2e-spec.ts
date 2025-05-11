import { MikroORM } from '@mikro-orm/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AuthTestUtil } from '../utils/auth-test.util';
import { TestAppModule } from '../utils/test-app.module';

/**
 * GraphQL Authentication E2E Tests
 * Based on BookNote PRD - Section 7 & 9
 * 
 * Tests GraphQL queries that require authentication.
 * Authentication operations (login, register, logout, refreshToken)
 * are handled by REST-only endpoints for security reasons. The GraphQL API
 * exposes the 'me' query for authenticated users.
 */
describe('Authentication GraphQL (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let authCookies: string[] = [];
  let testUserEmail: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule.forTest({ enableGraphQL: true })], // Use with GraphQL enabled
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Add cookie-parser middleware
    app.use(cookieParser());
    
    // Apply global pipes like in main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    orm = moduleFixture.get<MikroORM>(MikroORM);

    // Initialize database schema
    await orm.getSchemaGenerator().refreshDatabase();
    
    await app.init();
    
    // Generate a unique email for test user
    testUserEmail = `gql-test-${Date.now()}@example.com`;
    
    // Create a test user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testUserEmail,
        password: 'StrongPassword123!',
        displayName: 'GraphQL Test User',
        timezone: 'Asia/Seoul'
      });
      
    expect(registerResponse.status).toBe(201);
    testUserId = registerResponse.body.id;
    
    // Login to get auth cookies
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUserEmail,
        password: 'StrongPassword123!'
      });
      
    expect(loginResponse.status).toBe(201);
    
    // Get cookies for protected GraphQL queries
    authCookies = AuthTestUtil.getCookies(loginResponse);
    expect(authCookies.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    // Clean up database after tests
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
    await app.close();
  });

  describe('Protected GraphQL Queries', () => {
    it('should access protected query with valid auth cookies', async () => {
      const profileQuery = `
        query {
          me {
            id
            email
            displayName
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Cookie', authCookies)
        .send({
          query: profileQuery
        })
        .expect(200);

      expect(response.body.data?.me).toBeDefined();
      expect(response.body.data?.me?.id).toEqual(testUserId);
      expect(response.body.data?.me?.email).toEqual(testUserEmail);
    });

    it('should reject protected query without auth cookies', async () => {
      const profileQuery = `
        query {
          me {
            id
            email
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: profileQuery
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toContain('인증이 필요합니다');
    });
  });
}); 