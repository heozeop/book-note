import { Field, ObjectType } from "@nestjs/graphql";
import { BookType } from "./book.type";

@ObjectType()
export class CollectionType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverUrl?: string;

  @Field(() => [BookType], { nullable: true })
  books?: BookType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 