import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";
import { BooksModule } from "./books/books.module";

// 각 기능별 모듈 임포트
// 실제 모듈을 구현할 때 주석 해제
// import { NotesModule } from './notes/notes.module';
// import { ReadingStatusModule } from './reading-status/reading-status.module';
// import { StatisticsModule } from './statistics/statistics.module';
// import { UserSettingsModule } from './user-settings/user-settings.module';

@Module({
  imports: [
    // 환경 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // MikroORM 설정
    MikroOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        entities: ["./dist/**/*.entity.js"],
        entitiesTs: ["./src/**/*.entity.ts"],
        dbName: configService.get("DB_NAME"),
        user: configService.get("DB_USER"),
        password: configService.get("DB_PASSWORD"),
        host: configService.get("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        type: "mysql",
        debug: configService.get("NODE_ENV") === "development",
        autoLoadEntities: true,
        allowGlobalContext: true,
        migrations: {
          path: "./dist/migrations",
          pathTs: "./src/migrations",
        },
      }),
      inject: [ConfigService],
    }),

    // GraphQL 설정
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      playground: process.env.NODE_ENV !== "production",
    }),

    // 기능별 모듈
    AuthModule,
    BooksModule,
    // NotesModule,
    // ReadingStatusModule,
    // StatisticsModule,
    // UserSettingsModule,
  ],
})
export class AppModule {}
