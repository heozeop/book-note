import { MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RefreshToken, TokenStatus } from '../../../../src/auth/entities/refresh-token.entity';
import { User } from '../../../../src/auth/entities/user.entity';
import { RefreshTokenRepository } from '../../../../src/auth/repositories/refresh-token.repository';
import { UserRepository } from '../../../../src/auth/repositories/user.repository';
import { PasswordService } from '../../../../src/auth/services/password.service';
import { TokenService } from '../../../../src/auth/services/token.service';
import { AuthTestModule } from '../auth-test.module';

describe('TokenService', () => {
  let service: TokenService;
  let orm: MikroORM;
  let refreshTokenRepository: RefreshTokenRepository;
  let userRepository: UserRepository;
  let passwordService: PasswordService;
  let user: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
    }).compile();

    service = module.get<TokenService>(TokenService);
    refreshTokenRepository = module.get<RefreshTokenRepository>(RefreshTokenRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    passwordService = module.get<PasswordService>(PasswordService);
    orm = module.get<MikroORM>(MikroORM);

    // Create schema
    try {
      await orm.getSchemaGenerator().createSchema();

    } catch (error) {
      console.warn('Error with schema generator:', error);
    }
  });

  afterAll(async () => {
    // Drop schema and close connection
    try {
      await orm.getSchemaGenerator().dropSchema();
      await orm.close(true);
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();

    user = new User();
    user.id = 'test-id';
    user.email = 'test@example.com';
    user.passwordHash = 'hashed_password';
    user.displayName = 'Test User';
    await userRepository.persistAndFlush(user);
      
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(refreshTokenRepository).toBeDefined();
    expect(passwordService).toBeDefined();
  });

  describe('createRefreshToken', () => {
    it('should create a refresh token', async () => {
      // Given
      jest.spyOn(passwordService, 'generateSecureToken').mockReturnValue('secure_token');
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue('hashed_token');
      
      // When
      const result = await service.createRefreshToken(user, 'Test User Agent', '127.0.0.1');

      // Then
      expect(result).toBeDefined();
      expect(result.token).toBe('secure_token');
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken.tokenHash).toBe('hashed_token');
      expect(result.refreshToken.user.id).toBe(user.id);
      expect(result.refreshToken.userAgent).toBe('Test User Agent');
      expect(result.refreshToken.ipAddress).toBe('127.0.0.1');
      expect(result.refreshToken.status).toBe(TokenStatus.ACTIVE);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', async () => {
      // Given
      const tokenHash = 'hashed_token';
      const token = 'secure_token';
      
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue(tokenHash);
      
      // Create a token
      const refreshToken = new RefreshToken(user, tokenHash, new Date(Date.now() + 86400000)); // expires in 1 day
      await refreshTokenRepository.persistAndFlush(refreshToken);
      
      // When
      const result = await service.verifyRefreshToken(token);

      // Then
      expect(result).toBeDefined();
      if (result) {
        expect(result.tokenHash).toBe(tokenHash);
        expect(result.user.id).toBe(user.id);
      }
    });

    it('should return null for invalid token', async () => {
      // Given
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue('different_hash');
      
      // When
      const result = await service.verifyRefreshToken('invalid_token');

      // Then
      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      // Given
      const tokenHash = 'hashed_token';
      const token = 'secure_token';
      
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue(tokenHash);
      
      // Create an expired token
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const refreshToken = new RefreshToken(user, tokenHash, yesterday);
      await refreshTokenRepository.persistAndFlush(refreshToken);
      
      // When
      const result = await service.verifyRefreshToken(token);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a refresh token', async () => {
      // Given
      const tokenHash = 'hashed_token';
      const token = 'secure_token';
      
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue(tokenHash);
      
      // Create a token
      const refreshToken = new RefreshToken(user, tokenHash, new Date(Date.now() + 86400000));
      await refreshTokenRepository.persistAndFlush(refreshToken);
      
      // When
      const result = await service.revokeRefreshToken(token);

      // Then
      expect(result).toBe(true);
      
      // Check token status
      const updatedToken = await refreshTokenRepository.findOne({ id: refreshToken.id });
      if (updatedToken) {
        expect(updatedToken.status).toBe(TokenStatus.REVOKED);
        expect(updatedToken.revokedAt).toBeDefined();
      }
    });

    it('should return false if token does not exist', async () => {
      // Given
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue('hashed_token');
      
      // When
      const result = await service.revokeRefreshToken('nonexistent_token');

      // Then
      expect(result).toBe(false);
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all tokens for a user', async () => {
      // Given - create multiple tokens
      const token1 = new RefreshToken(user, 'hash1', new Date(Date.now() + 86400000));
      const token2 = new RefreshToken(user, 'hash2', new Date(Date.now() + 86400000));
      const token3 = new RefreshToken(user, 'hash3', new Date(Date.now() + 86400000));
      
      // Persist tokens one by one
      await refreshTokenRepository.persistAndFlush(token1);
      await refreshTokenRepository.persistAndFlush(token2);
      await refreshTokenRepository.persistAndFlush(token3);
      
      // When
      await service.revokeAllUserTokens(user.id);

      // Then
      const tokens = await refreshTokenRepository.findByUserId(user.id);
      expect(tokens.length).toBe(3);
      expect(tokens[0].status).toBe(TokenStatus.REVOKED);
      expect(tokens[1].status).toBe(TokenStatus.REVOKED);
      expect(tokens[2].status).toBe(TokenStatus.REVOKED);
      expect(tokens[0].revokedAt).toBeDefined();
      expect(tokens[1].revokedAt).toBeDefined();
      expect(tokens[2].revokedAt).toBeDefined();
    });
  });
}); 