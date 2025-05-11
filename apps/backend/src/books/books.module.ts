import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { BookController } from './controllers/book.controller';
import { Book } from './entities/book.entity';
import { BookRepository } from './repositories/book.repository';
import { BookResolver } from './resolvers/book.resolver';
import { BookService } from './services/book.service';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Book],
    }),
  ],
  controllers: [BookController],
  providers: [BookService, BookResolver, BookRepository],
  exports: [BookService],
})
export class BooksModule {} 