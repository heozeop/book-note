import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BookSearchModule } from './book-search/book-search.module';
import { BookController } from "./controllers/book.controller";
import { CollectionController } from "./controllers/collection.controller";
import { NoteController } from "./controllers/note.controller";
import { BookTagController, TagController } from "./controllers/tag.controller";
import { UserBookController } from "./controllers/user-book.controller";
import { BookCollection } from "./entities/book-collection.entity";
import { BookTag } from "./entities/book-tag.entity";
import { Book } from "./entities/book.entity";
import { Collection } from "./entities/collection.entity";
import { Note } from "./entities/note.entity";
import { ReadingLog } from "./entities/reading-log.entity";
import { ReadingStatus } from "./entities/reading-status.entity";
import { Tag } from "./entities/tag.entity";
import { UserBook } from "./entities/user-book.entity";
import { BookCollectionRepository } from "./repositories/book-collection.repository";
import { BookTagRepository } from "./repositories/book-tag.repository";
import { BookRepository } from "./repositories/book.repository";
import { CollectionRepository } from "./repositories/collection.repository";
import { NoteRepository } from "./repositories/note.repository";
import { TagRepository } from "./repositories/tag.repository";
import { UserBookRepository } from "./repositories/user-book.repository";
import { BookResolver } from "./resolvers/book.resolver";
import { CollectionResolver } from "./resolvers/collection.resolver";
import { BookService } from "./services/book.service";
import { CollectionService } from "./services/collection.service";
import { NoteService } from "./services/note.service";
import { TagService } from "./services/tag.service";
import { UserBookService } from "./services/user-book.service";

import './graphql/types/book-status.enum';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [
        Book, 
        Collection, 
        UserBook, 
        ReadingStatus, 
        ReadingLog, 
        BookCollection,
        BookTag,
        Tag,
        Note
      ],
    }),
    ConfigModule,
    BookSearchModule,
  ],
  controllers: [
    BookController, 
    UserBookController, 
    CollectionController,
    TagController,
    BookTagController,
    NoteController
  ],
  providers: [
    BookService,
    UserBookService,
    CollectionService,
    TagService,
    NoteService,
    BookRepository,
    UserBookRepository,
    CollectionRepository,
    BookCollectionRepository,
    BookTagRepository,
    TagRepository,
    NoteRepository,
    BookResolver,
    CollectionResolver,
  ],
})
export class BooksModule {}
