import { Options } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { RefreshToken } from './src/auth/entities/refresh-token.entity';
import { User } from './src/auth/entities/user.entity';
import { BookCollection } from './src/books/entities/book-collection.entity';
import { Book } from './src/books/entities/book.entity';
import { Collection } from './src/books/entities/collection.entity';

// Mikro-ORM configuration
const ormConfig: Options = defineConfig({
  entities: [User, RefreshToken, Book, Collection, BookCollection],
  allowGlobalContext: true,
  discovery: {
    warnWhenNoEntities: true,
    requireEntitiesArray: false,
    alwaysAnalyseProperties: true,
    disableDynamicFileAccess: false,
  },
  // Schema configuration
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: false,
  },
}); 

export default ormConfig