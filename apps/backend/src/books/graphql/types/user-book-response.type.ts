import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserBookResponseDto } from '../../dtos/user-book.response.dto';
import { BookStatus } from '../../entities/reading-status.entity';
import { BookType } from './book.type';
import { TagType } from './tag.type';

@ObjectType()
export class UserBookResponseType {
  @Field(() => ID)
  id: string;

  @Field(() => BookType)
  book: BookType;

  @Field()
  status: BookStatus;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  finishedAt?: Date;

  @Field(() => [TagType], { nullable: true })
  tags?: TagType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  /**
   * Convert from DTO to GraphQL type
   */
  static fromDto(dto: UserBookResponseDto): UserBookResponseType {
    if (!dto) {
      // Create an empty response with default values for safety
      const empty = new UserBookResponseType();
      empty.id = '0';
      empty.book = new BookType();
      empty.book.id = '0';
      empty.book.title = 'Unknown';
      empty.status = BookStatus.WANT_TO_READ;
      empty.createdAt = new Date();
      empty.updatedAt = new Date();
      return empty;
    }
    
    const type = new UserBookResponseType();
    type.id = dto.id;
    type.status = dto.status;
    type.startedAt = dto.startedAt;
    type.finishedAt = dto.finishedAt;
    
    // Convert book
    type.book = new BookType();
    if (dto.book) {
      type.book.id = dto.book.id;
      type.book.title = dto.book.title;
      type.book.author = dto.book.author;
      type.book.isbn = dto.book.isbn;
      type.book.description = dto.book.description;
      type.book.coverUrl = dto.book.coverUrl;
      type.book.publisher = dto.book.publisher;
      type.book.publishedDate = dto.book.publishedDate;
      type.book.pageCount = dto.book.pageCount;
    } else {
      type.book.id = '0';
      type.book.title = 'Unknown';
    }
    
    // Convert tags if they exist
    if (dto.tags && dto.tags.length > 0) {
      type.tags = dto.tags.map(tag => {
        const tagType = new TagType();
        tagType.id = tag.id;
        tagType.name = tag.name;
        if (tag.userId) tagType.userId = tag.userId;
        tagType.createdAt = new Date();
        tagType.updatedAt = new Date();
        return tagType;
      });
    }
    
    type.createdAt = dto.createdAt || new Date();
    type.updatedAt = dto.updatedAt || new Date();
    
    return type;
  }
} 