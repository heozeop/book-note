import { UserType } from "@/auth/graphql/types";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BookType } from "./book.type";

@ObjectType("Collection")
export class CollectionType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field()
  isDefault: boolean;

  @Field(() => UserType)
  owner: UserType;

  @Field(() => [BookType], { nullable: true })
  books?: BookType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 