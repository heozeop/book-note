import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { BookController } from "../../controllers/book.controller";
import { UserBookController } from "../../controllers/user-book.controller";
import { BookResolver } from "../../resolvers/book.resolver";
import { Book, ReadingLog, ReadingStatus, UserBook } from "./entities";
import { BookRepository, UserBookRepository } from "./repositories";
import { BookService, UserBookService } from "./services";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [
        Book,
        UserBook,
        ReadingStatus,
        ReadingLog
      ],
    }),
  ],
  controllers: [
    BookController,
    UserBookController
  ],
  providers: [
    BookService,
    UserBookService,
    BookRepository,
    UserBookRepository,
    BookResolver
  ],
  exports: [
    BookService,
    UserBookService,
    BookRepository,
    UserBookRepository
  ]
})
export class BookModule {} 