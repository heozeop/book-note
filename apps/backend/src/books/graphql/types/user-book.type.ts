import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { UserType } from "../../../auth/graphql/types/user.type";
import { BookStatus } from "../../entities/reading-status.entity";
import { BookType } from "./book.type";
import { NoteType } from "./note.type";

@ObjectType()
export class UserBookType {
  @Field(() => ID)
  id: string;

  @Field(() => UserType)
  user: UserType;

  @Field(() => BookType)
  book: BookType;

  @Field()
  isPrivate: boolean;

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field({ nullable: true })
  boughtAt?: Date;
  
  @Field({ nullable: true })
  userNotes?: string;

  @Field(() => String)
  status: BookStatus;

  @Field({ nullable: true })
  currentPage?: number;

  @Field()
  rereadCount: number;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  finishedAt?: Date;

  @Field(() => [NoteType], { nullable: true })
  notes?: NoteType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 