import { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Test, TestingModule } from "@nestjs/testing";
import { GqlAuthGuard } from "../../../../src/auth/guards/gql-auth.guard";
import { AuthTestModule } from "../auth-test.module";

jest.mock("@nestjs/graphql", () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe("GqlAuthGuard", () => {
  let guard: GqlAuthGuard;
  let mockExecutionContext: ExecutionContext;
  let mockGqlContext: {
    getContext: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
      providers: [GqlAuthGuard],
    }).compile();

    guard = module.get<GqlAuthGuard>(GqlAuthGuard);

    // Create mock execution context
    mockExecutionContext = {
      getType: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as unknown as ExecutionContext;

    // Create mock GraphQL context
    mockGqlContext = {
      getContext: jest.fn(),
    };

    // Setup the GQL context mock
    (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("getRequest", () => {
    it("should extract request from GraphQL context", () => {
      // Arrange
      const mockRequest = { headers: { authorization: "Bearer test-token" } };
      mockGqlContext.getContext.mockReturnValue({ req: mockRequest });

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(GqlExecutionContext.create).toHaveBeenCalledWith(
        mockExecutionContext,
      );
      expect(mockGqlContext.getContext).toHaveBeenCalled();
      expect(result).toBe(mockRequest);
    });

    it("should handle context without req property", () => {
      // Arrange
      mockGqlContext.getContext.mockReturnValue({});

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
