import { Options } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { RefreshToken } from "../src/auth/entities/refresh-token.entity";
import { User } from "../src/auth/entities/user.entity";

// Test-specific Mikro-ORM configuration
const testConfig: Options = {
  driver: SqliteDriver,
  dbName: ":memory:",
  entities: [User, RefreshToken],
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
