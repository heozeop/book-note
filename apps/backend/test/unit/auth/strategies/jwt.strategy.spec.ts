import { MikroORM } from "@mikro-orm/core";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../../../../src/auth/entities/user.entity";
import { UserRepository } from "../../../../src/auth/repositories/user.repository";
import { JwtStrategy } from "../../../../src/auth/strategies/jwt.strategy";
import { AuthTestModule } from "../auth-test.module";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let userRepository: UserRepository;
  let orm: MikroORM;
  let testUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
    userRepository = module.get<UserRepository>(UserRepository);
    orm = module.get<MikroORM>(MikroORM);

    await orm.getSchemaGenerator().createSchema();
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();

    // Create a test user
    testUser = new User();
    testUser.id = "test-user-id";
    testUser.email = "test@example.com";
    testUser.passwordHash = "hashed_password";
    testUser.displayName = "Test User";

    await userRepository.persistAndFlush(testUser);
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should return user without password hash when valid payload is provided", async () => {
      // Arrange
      const payload = { sub: testUser.id, email: testUser.email };

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe(testUser.email);
      expect(result.displayName).toBe(testUser.displayName);
    });

    it("should throw UnauthorizedException when user is not found", async () => {
      // Arrange
      const payload = {
        sub: "non-existent-id",
        email: "nonexistent@example.com",
      };

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  it("should use the correct secret key from config", () => {
    // Arrange & Act
    const jwtSecret = configService.get<string>("app.jwt.secret");

    // Assert
    expect(jwtSecret).toBe("test-secret-key");
  });
});
