import { Collection } from '../modules/collections/entities/collection.entity';
import { BookResponseDto } from './book.response.dto';

export class CollectionResponseDto {
  id: string;
  name: string;
  description?: string;
  books?: BookResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(collection: Collection, books: BookResponseDto[] = []): CollectionResponseDto {
    const dto = new CollectionResponseDto();
    dto.id = collection.id;
    dto.name = collection.name;
    dto.description = collection.description;
    dto.books = books;
    dto.createdAt = collection.createdAt;
    dto.updatedAt = collection.updatedAt;

    return dto;
  }
} 