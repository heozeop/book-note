import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BookType {
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

  @Field(() => Int, { nullable: true })
  pageCount?: number;

  @Field(() => Number, { nullable: true })
  price?: number;

  @Field(() => Number, { nullable: true })
  discount?: number;

  @Field({ nullable: true })
  language?: string;

  @Field({ nullable: true })
  externalId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
