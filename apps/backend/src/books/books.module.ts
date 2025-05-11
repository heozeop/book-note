import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { BookController } from "./controllers/book.controller";
import { BookCollection } from "./entities/book-collection.entity";
import { Book } from "./entities/book.entity";
import { Collection } from "./entities/collection.entity";
import { BookCollectionRepository } from "./repositories/book-collection.repository";
import { BookRepository } from "./repositories/book.repository";
import { CollectionRepository } from "./repositories/collection.repository";
import { BookResolver } from "./resolvers/book.resolver";
import { BookService } from "./services/book.service";

import './graphql/types/book-status.enum';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Book, Collection, BookCollection],
    }),
  ],
  controllers: [BookController],
  providers: [
    BookService, 
    BookResolver, 
    BookRepository,
    CollectionRepository,
    BookCollectionRepository,
  ],
  exports: [BookService],
})
export class BooksModule {}
