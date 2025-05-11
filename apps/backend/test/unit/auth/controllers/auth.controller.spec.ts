import { MikroORM } from '@mikro-orm/core';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../../src/auth/controllers/auth.controller';
import { LoginDto } from '../../../../src/auth/dtos/login.dto';
import { RegisterUserDto } from '../../../../src/auth/dtos/register-user.dto';
import { User } from '../../../../src/auth/entities/user.entity';
import { UserRepository } from '../../../../src/auth/repositories/user.repository';
import { AuthService } from '../../../../src/auth/services/auth.service';
import { PasswordService } from '../../../../src/auth/services/password.service';
import { TokenService } from '../../../../src/auth/services/token.service';
import { AuthTestModule } from '../auth-test.module';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let passwordService: PasswordService;
  let tokenService: TokenService;
  let userRepository: UserRepository;
  let orm: MikroORM;

  beforeEach(async () => {
    // Clear mock data
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    passwordService = module.get<PasswordService>(PasswordService);
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
    expect(controller).toBeDefined();
    expect(authService).toBeDefined();
    expect(passwordService).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      // Given
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        displayName: 'Test User',
      };

      const mockUser = new User();
      mockUser.id = 'test-id';
      mockUser.email = registerDto.email;
      mockUser.displayName = registerDto.displayName;
      mockUser.verifiedAt = undefined;
      mockUser.createdAt = new Date();

      jest.spyOn(authService, 'register').mockResolvedValue(mockUser);
      
      // When
      const result = await controller.register(registerDto);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.displayName).toBe(mockUser.displayName);
      expect(result.isVerified).toBe(false);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      // Given
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
      };

      const mockUser = new User();
      mockUser.id = 'test-id';
      mockUser.email = loginDto.email;
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

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);
      jest.spyOn(authService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(tokenService, 'createRefreshToken').mockResolvedValue(mockRefreshTokenResponse);
      
      // When
      const result = await controller.login(loginDto, 'test-user-agent', '127.0.0.1');

      // Then
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.token).toBeDefined();
      expect(result.token.accessToken).toBe('access-token');
      expect(result.token.refreshToken).toBe('refresh-token');
      
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.findUserById).toHaveBeenCalledWith(mockUser.id);
      expect(tokenService.createRefreshToken).toHaveBeenCalledWith(
        mockUser,
        'test-user-agent',
        '127.0.0.1',
      );
    });

    it('should throw an error if user is not found after login', async () => {
      // Given
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
      };

      const mockUser = { id: 'test-id' } as any;
      const mockAuthResponse = {
        accessToken: 'access-token',
        user: mockUser,
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);
      jest.spyOn(authService, 'findUserById').mockResolvedValue(null);
      
      // When & Then
      await expect(controller.login(loginDto, 'test-user-agent', '127.0.0.1'))
        .rejects.toThrow();
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

      jest.spyOn(tokenService, 'verifyRefreshToken').mockResolvedValue(mockToken);
      jest.spyOn(tokenService, 'revokeRefreshToken').mockResolvedValue(true);
      jest.spyOn(authService, 'findUserById').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);
      jest.spyOn(tokenService, 'createRefreshToken').mockResolvedValue(mockRefreshTokenResponse);
      
      // When
      const result = await controller.refreshToken(refreshToken, 'test-user-agent', '127.0.0.1');

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
      
      jest.spyOn(tokenService, 'verifyRefreshToken').mockResolvedValue(null);
      
      // When & Then
      await expect(controller.refreshToken(refreshToken, 'test-user-agent', '127.0.0.1'))
        .rejects.toThrow(UnauthorizedException);
      
      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should throw an error if user is not found', async () => {
      // Given
      const refreshToken = 'valid-refresh-token';
      const mockToken = {
        id: 'token-id',
        user: { id: 'user-id' } as any,
        isValid: () => true,
      } as any;
      
      jest.spyOn(tokenService, 'verifyRefreshToken').mockResolvedValue(mockToken);
      jest.spyOn(tokenService, 'revokeRefreshToken').mockResolvedValue(true);
      jest.spyOn(authService, 'findUserById').mockResolvedValue(null);
      
      // When & Then
      await expect(controller.refreshToken(refreshToken, 'test-user-agent', '127.0.0.1'))
        .rejects.toThrow(UnauthorizedException);
      
      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(authService.findUserById).toHaveBeenCalledWith('user-id');
    });
  });

  describe('checkPasswordStrength', () => {
    it('should return password strength and feedback', () => {
      // Given
      const password = 'StrongPassword123!';
      
      jest.spyOn(passwordService, 'evaluatePasswordStrength').mockReturnValue(90);
      
      // When
      const result = controller.checkPasswordStrength(password);

      // Then
      expect(result).toBeDefined();
      expect(result.strength).toBe(90);
      expect(result.feedback).toBe('강력한 비밀번호입니다.');
      expect(passwordService.evaluatePasswordStrength).toHaveBeenCalledWith(password);
    });

    it('should return appropriate feedback for different strength levels', () => {
      // Given
      jest.spyOn(passwordService, 'evaluatePasswordStrength')
        .mockReturnValueOnce(20)  // 매우 취약
        .mockReturnValueOnce(50)  // 취약
        .mockReturnValueOnce(70); // 적절한
      
      // When
      const result1 = controller.checkPasswordStrength('weak');
      const result2 = controller.checkPasswordStrength('medium');
      const result3 = controller.checkPasswordStrength('good');

      // Then
      expect(result1.feedback).toBe('매우 취약한 비밀번호입니다.');
      expect(result2.feedback).toBe('취약한 비밀번호입니다. 더 강력한 비밀번호를 사용하세요.');
      expect(result3.feedback).toBe('적절한 비밀번호입니다.');
    });
  });
}); 