import { UserType } from "@/auth/graphql/types";
import { BookStatus } from "@/books/entities/book.entity";
import { NoteType } from "@/notes/graphql/types/note.type";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType("Book")
export class BookType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  author?: string;

  @Field({ nullable: true })
  isbn?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  publishedDate?: Date;

  @Field({ nullable: true })
  publisher?: string;

  @Field(() => BookStatus)
  status: BookStatus;

  @Field({ nullable: true })
  currentPage?: number;

  @Field({ nullable: true })
  totalPages?: number;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  finishedAt?: Date;

  @Field(() => String, { nullable: true })
  metadata?: string;

  @Field(() => UserType)
  owner: UserType;

  @Field(() => [NoteType], { nullable: true })
  notes?: NoteType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
