import { Options } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { RefreshToken } from "../src/auth/entities/refresh-token.entity";
import { User } from "../src/auth/entities/user.entity";
import { BookCollection } from "../src/books/entities/book-collection.entity";
import { BookTag } from "../src/books/entities/book-tag.entity";
import { Book } from "../src/books/entities/book.entity";
import { Collection } from "../src/books/entities/collection.entity";
import { PageNoteTag } from "../src/books/entities/page-note-tag.entity";
import { PageNote } from "../src/books/entities/page-note.entity";
import { Quote } from "../src/books/entities/quote.entity";
import { Reaction } from "../src/books/entities/reaction.entity";
import { ReadingLog } from "../src/books/entities/reading-log.entity";
import { ReadingStatus } from "../src/books/entities/reading-status.entity";
import { Stroke } from "../src/books/entities/stroke.entity";
import { Tag } from "../src/books/entities/tag.entity";
import { Thought } from "../src/books/entities/thought.entity";
import { UserBook } from "../src/books/entities/user-book.entity";

// Test-specific Mikro-ORM configuration
const testConfig: Options = {
  driver: SqliteDriver,
  dbName: ":memory:",
  entities: [
    User, 
    RefreshToken, 
    Book, 
    Collection, 
    UserBook, 
    ReadingStatus, 
    ReadingLog,
    Tag,
    BookTag,
    BookCollection,
    PageNote,
    Quote,
    Thought,
    Stroke,
    PageNoteTag,
    Reaction
  ],
  allowGlobalContext: true,
  discovery: {
    warnWhenNoEntities: true,
    requireEntitiesArray: false,
    alwaysAnalyseProperties: true,
    disableDynamicFileAccess: false,
  },
  // Drop tables when initializing
  forceUndefined: true,
  // Schema configuration
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: false,
  },
};

export default testConfig;
