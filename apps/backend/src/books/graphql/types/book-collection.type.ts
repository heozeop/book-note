import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BookType } from "./book.type";
import { CollectionType } from "./collection.type";

@ObjectType("BookCollection")
export class BookCollectionType {
  @Field(() => ID)
  id: string;

  @Field(() => BookType)
  book: BookType;

  @Field(() => CollectionType)
  collection: CollectionType;

  @Field()
  addedAt: Date;

  @Field({ nullable: true })
  order?: number;
} 