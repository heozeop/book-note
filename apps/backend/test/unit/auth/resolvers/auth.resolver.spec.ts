import { MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginInput, RegisterInput } from '../../../../src/auth/dtos/user.graphql';
import { User } from '../../../../src/auth/entities/user.entity';
import { UserRepository } from '../../../../src/auth/repositories/user.repository';
import { AuthResolver } from '../../../../src/auth/resolvers/auth.resolver';
import { AuthService } from '../../../../src/auth/services/auth.service';
import { TokenService } from '../../../../src/auth/services/token.service';
import { AuthTestModule } from '../auth-test.module';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;
  let tokenService: TokenService;
  let userRepository: UserRepository;
  let orm: MikroORM;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
      providers: [AuthResolver],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    userRepository = module.get<UserRepository>(UserRepository);
    orm = module.get<MikroORM>(MikroORM);

    // Be safe when using schema generator
    try {
      const generator = orm.getSchemaGenerator();
      await generator.createSchema();
    } catch (error) {
      console.warn('Error with schema generator:', error);
    }
  });

  afterEach(async () => {
    // Be safe when dropping schema
    try {
      if (orm) {
        const generator = orm.getSchemaGenerator();
        await generator.dropSchema();
        await orm.close(true);
      }
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(authService).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  describe('login', () => {
    it('should login a user and return auth payload', async () => {
      // Given
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
      };

      const mockUser = new User();
      mockUser.id = 'test-id';
      mockUser.email = loginInput.email;
      mockUser.displayName = 'Test User';
      mockUser.verifiedAt = undefined;
      mockUser.createdAt = new Date();

      const mockAuthResponse = {
        accessToken: 'access-token',
        user: mockUser,
      };

      const mockRefreshTokenResponse = {
        token: 'refresh-token',
        refreshToken: {} as any,
      };
      
      const mockContext = {
        req: {
          headers: { 'user-agent': 'test-user-agent' },
          ip: '127.0.0.1',
        },
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);
      jest.spyOn(tokenService, 'createRefreshToken').mockResolvedValue(mockRefreshTokenResponse);
      
      // When
      const result = await resolver.login(loginInput, mockContext);

      // Then
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBe('access-token');
      expect(result.tokens.refreshToken).toBe('refresh-token');
      
      expect(authService.login).toHaveBeenCalledWith({
        email: loginInput.email,
        password: loginInput.password,
      });
      expect(tokenService.createRefreshToken).toHaveBeenCalledWith(
        mockUser,
        'test-user-agent',
        '127.0.0.1',
      );
    });
  });

  describe('register', () => {
    it('should register a new user and return auth payload', async () => {
      // Given
      const registerInput: RegisterInput = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        displayName: 'Test User',
      };

      const mockUser = new User();
      mockUser.id = 'test-id';
      mockUser.email = registerInput.email;
      mockUser.displayName = registerInput.displayName;
      mockUser.verifiedAt = undefined;
      mockUser.createdAt = new Date();

      const mockAuthResponse = {
        accessToken: 'access-token',
        user: mockUser,
      };

      const mockRefreshTokenResponse = {
        token: 'refresh-token',
        refreshToken: {} as any,
      };
      
      const mockContext = {
        req: {
          headers: { 'user-agent': 'test-user-agent' },
          ip: '127.0.0.1',
        },
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);
      jest.spyOn(tokenService, 'createRefreshToken').mockResolvedValue(mockRefreshTokenResponse);
      
      // When
      const result = await resolver.register(registerInput, mockContext);

      // Then
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBe('access-token');
      expect(result.tokens.refreshToken).toBe('refresh-token');
      
      expect(authService.register).toHaveBeenCalledWith({
        email: registerInput.email,
        password: registerInput.password,
        displayName: registerInput.displayName,
        profileImage: undefined,
        timezone: undefined,
      });
      expect(authService.login).toHaveBeenCalledWith({
        email: registerInput.email,
        password: registerInput.password,
      });
      expect(tokenService.createRefreshToken).toHaveBeenCalledWith(
        mockUser,
        'test-user-agent',
        '127.0.0.1',
      );
    });
  });

  describe('logout', () => {
    it('should logout a user by revoking refresh token', async () => {
      // Given
      const refreshToken = 'valid-refresh-token';
      
      jest.spyOn(tokenService, 'revokeRefreshToken').mockResolvedValue(true);
      
      // When
      const result = await resolver.logout(refreshToken);

      // Then
      expect(result).toBe(true);
      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('me', () => {
    it('should return the current user', async () => {
      // Given
      const mockUser = new User();
      mockUser.id = 'test-id';
      mockUser.email = 'test@example.com';
      mockUser.displayName = 'Test User';
      mockUser.verifiedAt = undefined;
      mockUser.createdAt = new Date();
      
      jest.spyOn(authService, 'findUserById').mockResolvedValue(mockUser);
      
      // When
      const result = await resolver.me(mockUser);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.isVerified).toBe(false);
      
      expect(authService.findUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error if user not found', async () => {
      // Given
      const mockUser = new User();
      mockUser.id = 'test-id';
      
      jest.spyOn(authService, 'findUserById').mockResolvedValue(null);
      
      // When & Then
      await expect(resolver.me(mockUser)).rejects.toThrow();
      
      expect(authService.findUserById).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('refreshToken', () => {
    it('should refresh an access token', async () => {
      // Given
      const refreshToken = 'valid-refresh-token';
      const mockToken = {
        id: 'token-id',
        user: { id: 'user-id' } as any,
        isValid: () => true,
      } as any;
      
      const mockUser = new User();
      mockUser.id = 'user-id';
      mockUser.email = 'test@example.com';
      
      const mockAuthResponse = {
        accessToken: 'new-access-token',
        user: mockUser,
      };
      
      const mockRefreshTokenResponse = {
        token: 'new-refresh-token',
        refreshToken: {} as any,
      };
      
      const mockContext = {
        req: {
          headers: { 'user-agent': 'test-user-agent' },
          ip: '127.0.0.1',
        },
      };

      jest.spyOn(tokenService, 'verifyRefreshToken').mockResolvedValue(mockToken);
      jest.spyOn(tokenService, 'revokeRefreshToken').mockResolvedValue(true);
      jest.spyOn(authService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);
      jest.spyOn(tokenService, 'createRefreshToken').mockResolvedValue(mockRefreshTokenResponse);
      
      // When
      const result = await resolver.refreshToken(refreshToken, mockContext);

      // Then
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      
      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(authService.findUserById).toHaveBeenCalledWith('user-id');
      expect(authService.login).toHaveBeenCalledWith({
        email: mockUser.email,
        password: '',
      });
      expect(tokenService.createRefreshToken).toHaveBeenCalledWith(
        mockUser,
        'test-user-agent',
        '127.0.0.1',
      );
    });

    it('should throw an error if refresh token is invalid', async () => {
      // Given
      const refreshToken = 'invalid-refresh-token';
      const mockContext = {
        req: {
          headers: { 'user-agent': 'test-user-agent' },
          ip: '127.0.0.1',
        },
      };
      
      jest.spyOn(tokenService, 'verifyRefreshToken').mockResolvedValue(null);
      
      // When & Then
      await expect(resolver.refreshToken(refreshToken, mockContext))
        .rejects.toThrow();
      
      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
    });
  });
}); 