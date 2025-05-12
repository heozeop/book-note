import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateBookInput {
  @Field({ nullable: true })
  title?: string;

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
} 