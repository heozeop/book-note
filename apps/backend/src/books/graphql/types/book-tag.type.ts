import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BookType } from "./book.type";
import { TagType } from "./tag.type";

@ObjectType()
export class BookTagType {
  @Field(() => ID)
  id: string;

  @Field(() => BookType)
  book: BookType;

  @Field(() => TagType)
  tag: TagType;

  @Field()
  createdAt: Date;
} 