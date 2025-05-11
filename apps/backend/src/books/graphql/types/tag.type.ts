import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BookType } from "./book.type";

@ObjectType()
export class TagType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  userId?: string;

  @Field(() => [BookType], { nullable: true })
  books?: BookType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 