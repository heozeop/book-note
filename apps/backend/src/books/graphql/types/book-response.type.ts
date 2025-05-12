import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BookResponseDto } from '../../dtos/book.response.dto';
import { TagResponseType } from './tag-response.type';

@ObjectType()
export class BookResponseType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  subTitle?: string;

  @Field({ nullable: true })
  author?: string;

  @Field({ nullable: true })
  isbn?: string;

  @Field({ nullable: true })
  coverUrl?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  publishedDate?: Date;

  @Field({ nullable: true })
  publisher?: string;

  @Field({ nullable: true })
  pageCount?: number;

  @Field({ nullable: true })
  price?: number;

  @Field({ nullable: true })
  discount?: number;

  @Field({ nullable: true })
  language?: string;

  @Field(() => [TagResponseType], { nullable: true })
  tags?: TagResponseType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  static fromDto(dto: BookResponseDto): BookResponseType {
    const type = new BookResponseType();
    type.id = dto.id;
    type.title = dto.title;
    type.subTitle = dto.subTitle;
    type.author = dto.author;
    type.description = dto.description;
    type.coverUrl = dto.coverUrl;
    type.isbn = dto.isbn;
    type.publishedDate = dto.publishedDate;
    type.publisher = dto.publisher;
    type.pageCount = dto.pageCount;
    type.price = dto.price;
    type.discount = dto.discount;
    type.language = dto.language;
    type.tags = dto.tags?.map(tag => TagResponseType.fromDto(tag));
    type.createdAt = dto.createdAt;
    type.updatedAt = dto.updatedAt;
    return type;
  }
} 