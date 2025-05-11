import { MikroORM } from "@mikro-orm/core";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../../../../src/auth/entities/user.entity";
import { UserRepository } from "../../../../src/auth/repositories/user.repository";
import { AuthResolver } from "../../../../src/auth/resolvers/auth.resolver";
import { AuthService } from "../../../../src/auth/services/auth.service";
import { AuthTestModule } from "../auth-test.module";

describe("AuthResolver", () => {
  let resolver: AuthResolver;
  let authService: AuthService;
  let userRepository: UserRepository;
  let orm: MikroORM;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
      providers: [AuthResolver],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    orm = module.get<MikroORM>(MikroORM);

    // Be safe when using schema generator
    try {
      const generator = orm.getSchemaGenerator();
      await generator.createSchema();
    } catch (error) {
      console.warn("Error with schema generator:", error);
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
      console.warn("Error during cleanup:", error);
    }
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe("me", () => {
    it("should return the current user", async () => {
      // Given
      const mockUser = new User();
      mockUser.id = "test-id";
      mockUser.email = "test@example.com";
      mockUser.displayName = "Test User";
      mockUser.verifiedAt = undefined;
      mockUser.createdAt = new Date();

      jest.spyOn(authService, "findUserById").mockResolvedValue(mockUser);

      // When
      const result = await resolver.me(mockUser);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.isVerified).toBe(false);

      expect(authService.findUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it("should throw error if user not found", async () => {
      // Given
      const mockUser = new User();
      mockUser.id = "test-id";

      jest.spyOn(authService, "findUserById").mockResolvedValue(null);

      // When & Then
      await expect(resolver.me(mockUser)).rejects.toThrow();

      expect(authService.findUserById).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
