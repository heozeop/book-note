import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { join } from "path";
import { AuthModule } from "../../../src/auth/auth.module";
import { RefreshToken } from "../../../src/auth/entities/refresh-token.entity";
import { User } from "../../../src/auth/entities/user.entity";
import testOrmConfig from "../../mikro-orm.test.config";

/**
 * Test Application Module
 *
 * This module is specifically designed for E2E tests and uses the SQLite in-memory
 * database configuration. It imports all necessary modules for authentication testing
 * while ensuring database isolation.
 */
@Module({})
export class TestAppModule {
  /**
   * Creates a test module with optional GraphQL support
   * @param options Configuration options
   * @returns A dynamic module for testing
   */
  static forTest(options: { enableGraphQL?: boolean } = {}): DynamicModule {
    const imports = [
      // Test configuration with environment variables
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: ".env.test",
        load: [
          () => ({
            app: {
              jwt: {
                secret: "test-secret-key",
                expiresIn: 3600, // 1 hour in seconds
                refreshTokenExpiryDays: 7,
              },
            },
            JWT_SECRET: "test-secret-key",
            JWT_EXPIRES_IN: 3600, // 1 hour in seconds
          }),
        ],
      }),

      // JWT Module with test settings
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: "test-secret-key",
          signOptions: {
            expiresIn: 3600, // 1 hour in seconds
          },
        }),
        inject: [ConfigService],
      }),

      // Passport Module
      PassportModule.register({ defaultStrategy: "jwt" }),

      // Configure MikroORM with test settings (SQLite in-memory)
      MikroOrmModule.forRoot(testOrmConfig),

      // Register entities
      MikroOrmModule.forFeature({
        entities: [User, RefreshToken],
      }),

      // Import Auth module
      AuthModule,
    ];

    // Conditionally add GraphQL if enabled
    if (options.enableGraphQL) {
      imports.push(
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), "test/e2e/schema.gql"),
          sortSchema: true,
          playground: false,
        }),
      );
    }

    return {
      module: TestAppModule,
      imports,
      exports: [
        ConfigModule,
        JwtModule,
        PassportModule,
        MikroOrmModule,
        ...(options.enableGraphQL ? [GraphQLModule] : []),
      ],
    };
  }
}
