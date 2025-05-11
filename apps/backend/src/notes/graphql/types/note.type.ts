import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserType } from "../../../auth/graphql/types/user.type";
import { BookType } from "../../../books/graphql/types/book.type";
import { ThoughtType } from "./thought.type";

@ObjectType("Note")
export class NoteType {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  page?: number;

  @Field({ nullable: true })
  chapter?: string;

  @Field({ nullable: true })
  highlight?: string;

  @Field({ nullable: true })
  personalThoughts?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => BookType)
  book: BookType;

  @Field(() => UserType)
  author: UserType;

  @Field(() => [ThoughtType], { nullable: true })
  thoughts?: ThoughtType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
