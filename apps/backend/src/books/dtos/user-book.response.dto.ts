import { BookStatus } from '../modules/book/entities/reading-status.entity';
import { UserBook } from '../modules/book/entities/user-book.entity';
import { BookResponseDto } from './book.response.dto';
import { TagResponseDto } from './tag.response.dto';

export class UserBookResponseDto {
  id: string;
  book: BookResponseDto;
  status: BookStatus;
  startedAt?: Date;
  finishedAt?: Date;
  tags: TagResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(userBook: UserBook, tags: TagResponseDto[] = []): UserBookResponseDto {
    const dto = new UserBookResponseDto();
    dto.id = userBook.id;
    dto.book = BookResponseDto.fromEntity(userBook.book, tags);
    dto.status = userBook.status;
    dto.startedAt = userBook.startedAt;
    dto.finishedAt = userBook.finishedAt;
    dto.tags = tags;
    dto.createdAt = userBook.createdAt;
    dto.updatedAt = userBook.updatedAt;

    return dto;
  }
} 