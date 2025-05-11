import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BookType } from "./book.type";

@ObjectType()
export class BookItemType {
  @Field()
  title: string;

  @Field({ nullable: true })
  subTitle?: string;

  @Field()
  author: string;

  @Field()
  publisher: string;

  @Field({ nullable: true })
  publishedDate?: Date;

  @Field()
  isbn: string;

  @Field()
  description: string;

  @Field()
  coverUrl: string;

  @Field(() => Int, { nullable: true })
  price?: number;

  @Field(() => Int, { nullable: true })
  discount?: number;

  @Field({ nullable: true })
  externalId?: string;
}

@ObjectType()
export class BookSearchResponseType {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  start: number;

  @Field(() => Int)
  display: number;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => [BookType])
  items: BookType[];
} 