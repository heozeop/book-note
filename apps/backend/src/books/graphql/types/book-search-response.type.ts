import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BookSearchResponseDto } from '../../dtos/book-search.response.dto';
import { BookSearchItemType } from './book-search-item.type';

@ObjectType()
export class BookSearchResponseType {
  @Field(() => Int)
  total: number;

  @Field(() => Int, { nullable: true })
  start?: number;

  @Field(() => Int, { nullable: true })
  display?: number;

  @Field(() => Int)
  page: number;

  @Field(() => [BookSearchItemType])
  items: BookSearchItemType[];

  static fromDto(dto: BookSearchResponseDto): BookSearchResponseType {
    const type = new BookSearchResponseType();
    type.total = dto.total;
    type.start = dto.start;
    type.display = dto.display;
    type.page = dto.page;
    type.items = dto.items.map(item => BookSearchItemType.fromDto(item));
    return type;
  }
} 