import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { User } from "../../../src/auth/entities/user.entity";
import { BookCollection } from "../../../src/books/entities/book-collection.entity";
import { Book } from "../../../src/books/entities/book.entity";
import { Collection } from "../../../src/books/entities/collection.entity";
import { BookCollectionRepository } from "../../../src/books/repositories/book-collection.repository";
import { BookRepository } from "../../../src/books/repositories/book.repository";
import { CollectionRepository } from "../../../src/books/repositories/collection.repository";
import { BookService } from "../../../src/books/services/book.service";
import testOrmConfig from "../../mikro-orm.test.config";

/**
 * 책 모듈 테스트를 위한 테스트 모듈입니다.
 * SQLite 인메모리 데이터베이스를 사용합니다.
 */
@Module({
  imports: [
    // 테스트용 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.test",
    }),

    // 테스트용 MikroORM 모듈 (SQLite 인메모리 사용)
    MikroOrmModule.forRoot(testOrmConfig),

    // 엔티티 등록
    MikroOrmModule.forFeature({
      entities: [Book, Collection, BookCollection, User],
    }),
  ],
  providers: [
    BookService, 
    BookRepository,
    CollectionRepository,
    BookCollectionRepository,
  ],
  exports: [
    BookService,
    BookRepository,
    CollectionRepository,
    BookCollectionRepository,
    MikroOrmModule,
  ],
})
export class BooksTestModule {} 