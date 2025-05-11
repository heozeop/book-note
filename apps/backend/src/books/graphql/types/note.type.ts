import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { UserType } from "../../../auth/graphql/types/user.type";
import { BookType } from "./book.type";

@ObjectType()
export class NoteType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field()
  content: string;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field()
  isPublic: boolean;

  @Field(() => BookType)
  book: BookType;

  @Field(() => UserType)
  user: UserType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 