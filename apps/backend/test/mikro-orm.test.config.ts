import { Options } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { RefreshToken } from "../src/auth/entities/refresh-token.entity";
import { User } from "../src/auth/entities/user.entity";
import { BookTag } from "../src/books/entities/book-tag.entity";
import { Book } from "../src/books/entities/book.entity";
import { BookCollection } from "../src/books/entities/book-collection.entity";
import { Collection } from "../src/books/entities/collection.entity";
import { Note } from "../src/books/entities/note.entity";
import { ReadingLog } from "../src/books/entities/reading-log.entity";
import { ReadingStatus } from "../src/books/entities/reading-status.entity";
import { Tag } from "../src/books/entities/tag.entity";
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
    Note,
    Tag,
    BookTag,
    BookCollection
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
