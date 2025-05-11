import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { User } from "../../../src/auth/entities/user.entity";
import { BookSearchModule } from "../../../src/books/book-search/book-search.module";
import { Book } from "../../../src/books/entities/book.entity";
import { Collection } from "../../../src/books/entities/collection.entity";
import { ReadingLog } from "../../../src/books/entities/reading-log.entity";
import { ReadingStatus } from "../../../src/books/entities/reading-status.entity";
import { UserBook } from "../../../src/books/entities/user-book.entity";
import { BookRepository } from "../../../src/books/repositories/book.repository";
import { CollectionRepository } from "../../../src/books/repositories/collection.repository";
import { UserBookRepository } from "../../../src/books/repositories/user-book.repository";
import { BookService } from "../../../src/books/services/book.service";
import { UserBookService } from "../../../src/books/services/user-book.service";
import { Note } from "../../../src/notes/entities/note.entity";
import { Thought } from "../../../src/notes/entities/thought.entity";
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
      envFilePath: "../../.env.test",
    }),

    // 테스트용 MikroORM 모듈 (SQLite 인메모리 사용)
    MikroOrmModule.forRoot(testOrmConfig),

    // 엔티티 등록
    MikroOrmModule.forFeature({
      entities: [Book, Collection, UserBook, ReadingStatus, ReadingLog, User, Note, Thought],
    }),
    
    // 책 검색 모듈
    BookSearchModule,
  ],
  providers: [
    BookService, 
    UserBookService,
    BookRepository,
    CollectionRepository,
    UserBookRepository,
  ],
  exports: [
    BookService,
    UserBookService,
    BookRepository,
    CollectionRepository,
    UserBookRepository,
    MikroOrmModule,
  ],
})
export class BooksTestModule {} 