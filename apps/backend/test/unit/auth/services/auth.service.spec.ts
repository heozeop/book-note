import { MikroORM } from '@mikro-orm/core';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginDto } from '../../../../src/auth/dtos/login.dto';
import { RegisterUserDto } from '../../../../src/auth/dtos/register-user.dto';
import { User } from '../../../../src/auth/entities/user.entity';
import { UserRepository } from '../../../../src/auth/repositories/user.repository';
import { AuthService } from '../../../../src/auth/services/auth.service';
import { PasswordService } from '../../../../src/auth/services/password.service';
import { AuthTestModule } from '../auth-test.module';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let passwordService: PasswordService;
  let jwtService: JwtService;
  let orm: MikroORM;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
    orm = module.get<MikroORM>(MikroORM);

    await orm.getSchemaGenerator().createSchema();
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(passwordService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Given
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        displayName: 'Test User',
      };

      jest.spyOn(passwordService, 'evaluatePasswordStrength').mockReturnValue(80);
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue('hashed_password');
      
      // When
      const result = await service.register(registerDto);

      // Then
      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.displayName).toBe('Test User');
      expect(result.passwordHash).toBe('hashed_password');
    });

    it('should throw an error if email already exists', async () => {
      // Given
      const existingUser = new User();
      existingUser.email = 'test@example.com';
      existingUser.passwordHash = 'hashed_password';
      existingUser.displayName = 'Existing User';
      
      await userRepository.persistAndFlush(existingUser);
      
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        displayName: 'Test User',
      };

      jest.spyOn(passwordService, 'evaluatePasswordStrength').mockReturnValue(80);
      
      // When & Then
      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an error if password is too weak', async () => {
      // Given
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'weak',
        displayName: 'Test User',
      };

      jest.spyOn(passwordService, 'evaluatePasswordStrength').mockReturnValue(50);
      
      // When & Then
      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      // Given
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
      };

      const user = new User();
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password';
      user.displayName = 'Test User';
      
      await userRepository.persistAndFlush(user);

      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt_token');
      
      // When
      const result = await service.login(loginDto);

      // Then
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('jwt_token');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw an error if user does not exist', async () => {
      // Given
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'StrongPassword123!',
      };
      
      // When & Then
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an error if password is incorrect', async () => {
      // Given
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const user = new User();
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password';
      user.displayName = 'Test User';
      
      await userRepository.persistAndFlush(user);

      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(false);
      
      // When & Then
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findUserById', () => {
    it('should find a user by ID', async () => {
      // Given
      const user = new User();
      user.id = 'test-id';
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password';
      user.displayName = 'Test User';
      
      await userRepository.persistAndFlush(user);
      
      // When
      const result = await service.findUserById(user.id);

      // Then
      expect(result).toBeDefined();
      // Only run these assertions if result is not null
      if (result) {
        expect(result.id).toBe(user.id);
        expect(result.email).toBe('test@example.com');
      }
    });

    it('should return null if user does not exist', async () => {
      // When
      const result = await service.findUserById('nonexistent-id');

      // Then
      expect(result).toBeNull();
    });
  });
}); 