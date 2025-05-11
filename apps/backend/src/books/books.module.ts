import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BookController } from "./controllers/book.controller";
import { CollectionController } from "./controllers/collection.controller";
import { BookTagController, TagController } from "./controllers/tag.controller";
import { UserBookController } from "./controllers/user-book.controller";
import { BookCollection } from "./entities/book-collection.entity";
import { BookTag } from "./entities/book-tag.entity";
import { Book } from "./entities/book.entity";
import { Collection } from "./entities/collection.entity";
import { PageNoteTag } from "./entities/page-note-tag.entity";
import { PageNote } from "./entities/page-note.entity";
import { Quote } from "./entities/quote.entity";
import { Reaction } from "./entities/reaction.entity";
import { ReadingLog } from "./entities/reading-log.entity";
import { ReadingStatus } from "./entities/reading-status.entity";
import { Stroke } from "./entities/stroke.entity";
import { Tag } from "./entities/tag.entity";
import { Thought } from "./entities/thought.entity";
import { UserBook } from "./entities/user-book.entity";
import { BookSearchModule } from './modules/book-search/book-search.module';
import { BookCollectionRepository } from "./repositories/book-collection.repository";
import { BookTagRepository } from "./repositories/book-tag.repository";
import { BookRepository } from "./repositories/book.repository";
import { CollectionRepository } from "./repositories/collection.repository";
import { TagRepository } from "./repositories/tag.repository";
import { UserBookRepository } from "./repositories/user-book.repository";
import { BookResolver } from "./resolvers/book.resolver";
import { CollectionResolver } from "./resolvers/collection.resolver";
import { BookService } from "./services/book.service";
import { CollectionService } from "./services/collection.service";
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
        PageNote,
        Quote,
        Thought,
        Stroke,
        PageNoteTag,
        Reaction
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
    BookTagController
  ],
  providers: [
    BookService,
    UserBookService,
    CollectionService,
    TagService,
    BookRepository,
    UserBookRepository,
    CollectionRepository,
    BookCollectionRepository,
    BookTagRepository,
    TagRepository,
    BookResolver,
    CollectionResolver,
  ],
})
export class BooksModule {}
