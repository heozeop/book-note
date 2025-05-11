import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../../../src/auth/guards/jwt-auth.guard';
import { AuthTestModule } from '../auth-test.module';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockExecutionContext: ExecutionContext;
  let mockHttpContext: { getRequest: jest.Mock; getResponse: jest.Mock; getNext: jest.Mock };
  let mockGqlContext: { getContext: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    // Create mock HTTP context with request method
    mockHttpContext = {
      getRequest: jest.fn().mockReturnValue({ headers: { authorization: 'Bearer test-token' } }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    };

    // Mock execution context
    mockExecutionContext = {
      getType: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as unknown as ExecutionContext;

    // Create mock GraphQL context
    mockGqlContext = {
      getContext: jest.fn(),
    };

    // Setup the GraphQL context mock
    (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getRequest', () => {
    it('should return HTTP request when in HTTP context', () => {
      // Arrange
      const httpRequest = { headers: { authorization: 'Bearer test-token' } };
      mockHttpContext.getRequest.mockReturnValue(httpRequest);
      mockGqlContext.getContext.mockReturnValue({ req: null });
      
      // Act
      const request = guard.getRequest(mockExecutionContext);
      
      // Assert
      expect(request).toBe(httpRequest);
    });

    it('should return GraphQL request when in GraphQL context', () => {
      // Arrange
      const gqlRequest = { headers: { authorization: 'Bearer test-token' } };
      mockGqlContext.getContext.mockReturnValue({ req: gqlRequest });
      
      // Act
      const request = guard.getRequest(mockExecutionContext);
      
      // Assert
      expect(request).toBe(gqlRequest);
    });
  });

  describe('handleRequest', () => {
    it('should return user when valid', () => {
      // Arrange
      const user = { id: 'test-id', email: 'test@example.com' };
      
      // Act
      const result = guard.handleRequest(null, user);
      
      // Assert
      expect(result).toBe(user);
    });

    it('should throw original error when error is provided', () => {
      // Arrange
      const error = new Error('Test error');
      
      // Act & Assert
      expect(() => guard.handleRequest(error, null)).toThrow(error);
    });

    it('should throw UnauthorizedException when user is not provided', () => {
      // Act & Assert
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
    });
  });
}); 