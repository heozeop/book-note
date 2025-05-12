import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import './graphql/types/book-status.enum';
import { BookModule, CollectionsModule, NotesModule, TagsModule } from "./modules";
import { BookSearchModule } from "./modules/book-search/book-search.module";
import { BookFacadeService, CollectionFacadeService, PageNoteFacadeService, TagFacadeService, UserBookFacadeService } from "./services";

@Module({
  imports: [
    ConfigModule,
    BookModule,
    CollectionsModule,
    NotesModule,
    TagsModule,
    BookSearchModule
  ],
  providers: [
    BookFacadeService,
    TagFacadeService,
    CollectionFacadeService,
    UserBookFacadeService,
    PageNoteFacadeService
  ],
  exports: [
    BookFacadeService,
    TagFacadeService,
    CollectionFacadeService,
    UserBookFacadeService,
    PageNoteFacadeService
  ]
})
export class BooksModule {}
