import { MikroORM } from '@mikro-orm/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestAppModule } from '../utils/test-app.module';

/**
 * Authentication E2E Tests
 * Based on BookNote PRD - Section 7
 * 
 * These tests have been updated to reflect the architectural decision
 * to move authentication operations from GraphQL to REST.
 * All authentication endpoints (register, login, logout, refresh-token)
 * are now handled via REST for improved security.
 * 
 * Both access tokens and refresh tokens are now stored in HTTP-only cookies
 * for enhanced security rather than being returned in the response body.
 */
describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let testUserEmail: string;
  let testUserId: string;
  let authCookies: string[];

  // Helper function to safely access cookies
  const getCookies = (response: request.Response): string[] => {
    const cookies = response.headers['set-cookie'];
    return Array.isArray(cookies) ? cookies : [];
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule.forTest()], // Use without GraphQL
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global pipes like in main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    orm = moduleFixture.get<MikroORM>(MikroORM);
    const configService = moduleFixture.get(ConfigService);
    
    // Initialize database schema
    await orm.getSchemaGenerator().refreshDatabase();
    
    await app.init();
    
    // Generate a unique email for test user
    testUserEmail = `test-${Date.now()}@example.com`;
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();
  });

  afterAll(async () => {
    // Clean up database after tests
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
    await app.close();
  });

  describe('Registration Process', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: testUserEmail,
        password: 'StrongPassword123!',
        displayName: 'Test User',
        timezone: 'Asia/Seoul'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testUserEmail);
      expect(response.body).toHaveProperty('displayName', 'Test User');
      expect(response.body).not.toHaveProperty('passwordHash');
      
      // Save user ID for later tests
      testUserId = response.body.id;
    });

    it('should reject registration with weak password', async () => {
      const weakPasswordDto = {
        email: 'another-test@example.com',
        password: 'weak',
        displayName: 'Weak Password User'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordDto)
        .expect(400);

      // Check that any message about password requirements is included
      const messages = response.body.message;
      const hasPasswordRequirement = messages.some((msg: string) => 
        msg.includes('비밀번호') && msg.includes('8자')
      );
      expect(hasPasswordRequirement).toBeTruthy();
    });

    it('should reject duplicate email registration', async () => {
      // Register first user
      const registerDto = {
        email: testUserEmail,
        password: 'StrongPassword123!',
        displayName: 'Test User',
        timezone: 'Asia/Seoul'
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      // Try to register with the same email
      const duplicateDto = {
        email: testUserEmail, // Same email as first test
        password: 'AnotherStrongPwd123!',
        displayName: 'Duplicate User'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(duplicateDto)
        .expect(401);

      expect(response.body.message).toContain('이미 등록된 이메일');
    });
  });

  describe('Login Process', () => {
    it('should login with valid credentials and set HTTP-only cookies for both tokens', async () => {
      // First register a user
      const registerDto = {
        email: testUserEmail,
        password: 'StrongPassword123!',
        displayName: 'Test User',
        timezone: 'Asia/Seoul'
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      // Then try to login
      const loginDto = {
        email: testUserEmail,
        password: 'StrongPassword123!'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      // Verify response structure (no tokens in response body)
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUserEmail);
      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body).not.toHaveProperty('token');
      
      // Verify HTTP-only cookies were set
      const cookies = getCookies(response);
      expect(cookies.length).toBeGreaterThan(1); // Should have both access and refresh token cookies
      
      const hasAccessTokenCookie = cookies.some(cookie => 
        cookie.startsWith('accessToken=')
      );
      const hasRefreshTokenCookie = cookies.some(cookie => 
        cookie.startsWith('refreshToken=')
      );
      
      expect(hasAccessTokenCookie).toBeTruthy();
      expect(hasRefreshTokenCookie).toBeTruthy();
      
      // Save cookies for later tests
      authCookies = cookies;
    });

    it('should reject login with invalid credentials', async () => {
      const invalidLoginDto = {
        email: testUserEmail,
        password: 'WrongPassword123!'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginDto)
        .expect(401);

      expect(response.body.message).toContain('이메일 또는 비밀번호가 올바르지 않습니다');
      // No cookie should be set
      const cookies = getCookies(response);
      expect(cookies.length).toBe(0);
    });
  });

  describe('Token Refresh Process', () => {
    it('should refresh both tokens using HTTP-only cookies', async () => {
      // First register and login to get tokens
      const registerDto = {
        email: testUserEmail,
        password: 'StrongPassword123!',
        displayName: 'Test User',
        timezone: 'Asia/Seoul'
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'StrongPassword123!'
        });

      const cookies = getCookies(loginResponse);
      
      // Then try to refresh the tokens using the refresh token cookie
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', cookies)
        .expect(200);

      // Verify success response (no tokens in body)
      expect(refreshResponse.body).toHaveProperty('success', true);
      expect(refreshResponse.body).toHaveProperty('message', '토큰이 성공적으로 갱신되었습니다.');
      expect(refreshResponse.body).not.toHaveProperty('accessToken');
      expect(refreshResponse.body).not.toHaveProperty('refreshToken');
      
      // Verify we got new cookies for both tokens
      const newCookies = getCookies(refreshResponse);
      expect(newCookies.length).toBeGreaterThan(1);
      
      const hasAccessTokenCookie = newCookies.some(cookie => 
        cookie.startsWith('accessToken=')
      );
      const hasRefreshTokenCookie = newCookies.some(cookie => 
        cookie.startsWith('refreshToken=')
      );
      
      expect(hasAccessTokenCookie).toBeTruthy();
      expect(hasRefreshTokenCookie).toBeTruthy();
      
      // Ensure cookies are different (tokens rotated)
      expect(newCookies).not.toEqual(cookies);
    });

    it('should reject token refresh with no refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .expect(401);

      expect(response.body.message).toContain('리프레시 토큰이 제공되지 않았습니다');
    });

    it('should reject token refresh with invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', ['refreshToken=invalid-token'])
        .expect(401);

      expect(response.body.message).toContain('유효하지 않은 리프레시 토큰');
    });
  });

  describe('Current User Info', () => {
    it('should return current user info with valid auth cookie', async () => {
      // First register and login
      const registerDto = {
        email: testUserEmail,
        password: 'StrongPassword123!',
        displayName: 'Test User',
        timezone: 'Asia/Seoul'
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'StrongPassword123!'
        });

      const cookies = getCookies(loginResponse);

      // Then get current user info using the access token cookie
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testUserEmail);
      expect(response.body).toHaveProperty('displayName', 'Test User');
    });

    it('should reject request with no access token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);

      expect(response.body.message).toContain('인증 토큰이 없습니다');
    });
  });

  describe('Logout Process', () => {
    it('should logout user and clear all auth cookies', async () => {
      // First register and login
      const registerDto = {
        email: testUserEmail,
        password: 'StrongPassword123!',
        displayName: 'Test User',
        timezone: 'Asia/Seoul'
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'StrongPassword123!'
        });

      const cookies = getCookies(loginResponse);

      // Then logout using the cookies
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '로그아웃 되었습니다.');
      
      // Verify cookies were cleared
      const logoutCookies = getCookies(response);
      expect(logoutCookies.length).toBeGreaterThan(1);
      
      const hasExpiredAccessCookie = logoutCookies.some(cookie => 
        cookie.startsWith('accessToken=') && cookie.includes('expires=')
      );
      const hasExpiredRefreshCookie = logoutCookies.some(cookie => 
        cookie.startsWith('refreshToken=') && cookie.includes('expires=')
      );
      
      expect(hasExpiredAccessCookie).toBeTruthy();
      expect(hasExpiredRefreshCookie).toBeTruthy();
      
      // Verify user can't access protected routes anymore
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookies)
        .expect(401);
      
      // Verify tokens have been revoked by trying to refresh with them
      await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', cookies)
        .expect(401);
    });

    it('should still work with legacy refresh token in body', async () => {
      // First register and login
      const registerDto = {
        email: testUserEmail,
        password: 'StrongPassword123!',
        displayName: 'Test User',
        timezone: 'Asia/Seoul'
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'StrongPassword123!'
        });

      const cookies = getCookies(loginResponse);
      
      // Extract refresh token value from cookie for testing body approach
      const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
      if (!refreshTokenCookie) {
        fail('Refresh token cookie not found');
        return;
      }
      
      const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

      // Then logout with token in body
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookies.filter(c => c.startsWith('accessToken=')))
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify tokens have been revoked by trying to refresh with them
      await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', cookies)
        .expect(401);
    });
  });

  describe('Password Strength Check', () => {
    it('should evaluate password strength', async () => {
      const password = 'StrongPassword123!';
      
      const response = await request(app.getHttpServer())
        .get(`/auth/password-strength/${password}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('strength');
      expect(response.body).toHaveProperty('feedback');
      expect(response.body.strength).toBeGreaterThan(0);
    });
    
    it('should identify weak passwords', async () => {
      const password = 'weak';
      
      const response = await request(app.getHttpServer())
        .get(`/auth/password-strength/${password}`)
        .expect(200);
      
      expect(response.body.strength).toBeLessThan(60);
      expect(response.body.feedback).toContain('취약한 비밀번호');
    });
  });
}); 