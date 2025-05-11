import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PasswordService } from '../../../../src/auth/services/password.service';

describe('PasswordService', () => {
  let service: PasswordService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash password using bcrypt', async () => {
      // Arrange
      const plainPassword = 'TestPassword123!';
      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');
      
      // Act
      const hashedPassword = await service.hashPassword(plainPassword);
      
      // Assert
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(bcryptHashSpy).toHaveBeenCalled();
      expect(hashedPassword).not.toEqual(plainPassword);
      
      // Verify the hash format (bcrypt hashes start with '$2a$', '$2b$' or '$2y$')
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('should create different hashes for the same password', async () => {
      // Arrange
      const plainPassword = 'SecurePassword456!';
      
      // Act
      const hash1 = await service.hashPassword(plainPassword);
      const hash2 = await service.hashPassword(plainPassword);
      
      // Assert
      expect(hash1).not.toEqual(hash2); // Different salts should produce different hashes
    });
  });

  describe('validatePassword', () => {
    it('should return true for matching password', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword789!';
      const hashedPassword = await service.hashPassword(plainPassword);
      
      // Act
      const isValid = await service.validatePassword(plainPassword, hashedPassword);
      
      // Assert
      expect(isValid).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      // Arrange
      const correctPassword = 'CorrectPassword789!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await service.hashPassword(correctPassword);
      
      // Act
      const isValid = await service.validatePassword(wrongPassword, hashedPassword);
      
      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a token with default length', () => {
      // Arrange
      const randomBytesSpy = jest.spyOn(crypto, 'randomBytes');
      
      // Act
      const token = service.generateSecureToken();
      
      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes in hex format results in 64 characters
      expect(randomBytesSpy).toHaveBeenCalledWith(32);
    });

    it('should generate a token with custom length', () => {
      // Arrange
      const customLength = 16;
      const randomBytesSpy = jest.spyOn(crypto, 'randomBytes');
      
      // Act
      const token = service.generateSecureToken(customLength);
      
      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(customLength * 2); // Bytes in hex format
      expect(randomBytesSpy).toHaveBeenCalledWith(customLength);
    });

    it('should generate unique tokens each time', () => {
      // Act
      const token1 = service.generateSecureToken();
      const token2 = service.generateSecureToken();
      
      // Assert
      expect(token1).not.toEqual(token2);
    });
  });

  describe('evaluatePasswordStrength', () => {
    it('should give low score for short password', () => {
      // Arrange
      const weakPassword = 'weak';
      
      // Act
      const score = service.evaluatePasswordStrength(weakPassword);
      
      // Assert
      expect(score).toBeLessThan(30);
    });

    it('should give medium score for decent password', () => {
      // Arrange
      const decentPassword = 'Decent123';
      
      // Act
      const score = service.evaluatePasswordStrength(decentPassword);
      
      // Assert
      expect(score).toBeGreaterThanOrEqual(30);
      expect(score).toBeLessThan(70);
    });

    it('should give high score for strong password', () => {
      // Arrange
      const strongPassword = 'Str0ng_P@ssw0rd!';
      
      // Act
      const score = service.evaluatePasswordStrength(strongPassword);
      
      // Assert
      expect(score).toBeGreaterThanOrEqual(70);
    });

    it('should penalize for repeated characters', () => {
      // Arrange
      const repeatedCharsPassword = 'Passwoooord123!';
      const nonRepeatedPassword = 'Password123!';
      
      // Act
      const repeatedScore = service.evaluatePasswordStrength(repeatedCharsPassword);
      const nonRepeatedScore = service.evaluatePasswordStrength(nonRepeatedPassword);
      
      // Assert
      expect(repeatedScore).toBeLessThan(nonRepeatedScore);
    });

    it('should check for requirements correctly', () => {
      // Arrange and Act
      const onlyLowercase = service.evaluatePasswordStrength('onlylowercase');
      const withUppercase = service.evaluatePasswordStrength('withUppercase');
      const withNumbers = service.evaluatePasswordStrength('withNumbers123');
      const withSpecial = service.evaluatePasswordStrength('withSpecial!@#');
      const allFeatures = service.evaluatePasswordStrength('AllFeatures123!@#');
      
      // Assert - each additional feature should increase the score
      expect(withUppercase).toBeGreaterThan(onlyLowercase);
      expect(withNumbers).toBeGreaterThan(onlyLowercase);
      expect(withSpecial).toBeGreaterThan(onlyLowercase);
      expect(allFeatures).toBeGreaterThan(withUppercase);
      expect(allFeatures).toBeGreaterThan(withNumbers);
      expect(allFeatures).toBeGreaterThan(withSpecial);
    });

    it('should not exceed 100 points for any password', () => {
      // Arrange
      const superStrongPassword = 'Super_Str0ng_P@ssw0rd_With_Many_Characters!@#$%^&*()';
      
      // Act
      const score = service.evaluatePasswordStrength(superStrongPassword);
      
      // Assert
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should not go below 0 points for any password', () => {
      // Arrange
      const badPassword = 'aaaaaaaaaaaaaaaaaaaaaaaa'; // Many repeated characters
      
      // Act
      const score = service.evaluatePasswordStrength(badPassword);
      
      // Assert
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
}); 