import { LoadStrategy, Options } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import * as path from 'path';

// 환경 변수 불러오기
import * as dotenv from 'dotenv';
dotenv.config();

const config: Options = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'booknote',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  debug: process.env.NODE_ENV === 'development',
  loadStrategy: LoadStrategy.JOINED,
  highlighter: new SqlHighlighter(),
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: path.join(__dirname, './dist/migrations'),
    pathTs: path.join(__dirname, './src/migrations'),
    glob: '!(*.d).{js,ts}',
  },
  seeder: {
    path: path.join(__dirname, './dist/seeders'),
    pathTs: path.join(__dirname, './src/seeders'),
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
  },
  allowGlobalContext: true,
};

export default defineConfig(config); 