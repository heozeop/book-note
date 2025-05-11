import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BookResponseDto } from '../../dtos/book.response.dto';
import { TagType } from './tag.type';

@ObjectType()
export class BookResponseType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  author?: string;

  @Field({ nullable: true })
  isbn?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverUrl?: string;

  @Field({ nullable: true })
  publisher?: string;

  @Field({ nullable: true })
  publishedDate?: Date;

  @Field({ nullable: true })
  pageCount?: number;

  @Field(() => [TagType], { nullable: true })
  tags?: TagType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  /**
   * Convert from DTO to GraphQL type
   */
  static fromDto(dto: BookResponseDto): BookResponseType {
    if (!dto) {
      // Create an empty response with default values for safety
      const empty = new BookResponseType();
      empty.id = '0';
      empty.title = 'Unknown';
      empty.createdAt = new Date();
      empty.updatedAt = new Date();
      return empty;
    }
    
    const type = new BookResponseType();
    type.id = dto.id;
    type.title = dto.title;
    type.author = dto.author;
    type.isbn = dto.isbn;
    type.description = dto.description;
    type.coverUrl = dto.coverUrl;
    type.publisher = dto.publisher;
    type.publishedDate = dto.publishedDate;
    type.pageCount = dto.pageCount;
    
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
    
    type.createdAt = dto.createdAt;
    type.updatedAt = dto.updatedAt;
    
    return type;
  }
} 