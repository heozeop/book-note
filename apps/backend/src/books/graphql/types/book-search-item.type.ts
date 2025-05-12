import { Field, ObjectType } from '@nestjs/graphql';
import { BookSearchItemResponseDto } from '../../dtos/book-search.response.dto';

@ObjectType()
export class BookSearchItemType {
  @Field()
  title: string;

  @Field({ nullable: true })
  subTitle?: string;

  @Field({ nullable: true })
  link?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  author?: string;

  @Field({ nullable: true })
  price?: string;

  @Field({ nullable: true })
  discount?: string;

  @Field({ nullable: true })
  publisher?: string;

  @Field({ nullable: true })
  pubdate?: string;

  @Field({ nullable: true })
  isbn?: string;

  @Field({ nullable: true })
  description?: string;

  static fromDto(dto: BookSearchItemResponseDto): BookSearchItemType {
    const type = new BookSearchItemType();
    type.title = dto.title;
    type.subTitle = dto.subTitle;
    type.link = dto.link;
    type.image = dto.image;
    type.author = dto.author;
    type.price = dto.price;
    type.discount = dto.discount;
    type.publisher = dto.publisher;
    type.pubdate = dto.pubdate;
    type.isbn = dto.isbn;
    type.description = dto.description;
    return type;
  }
} 