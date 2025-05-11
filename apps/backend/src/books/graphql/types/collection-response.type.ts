import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Collection } from '../../entities/collection.entity';
import { BookResponseType } from './book-response.type';

@ObjectType()
export class CollectionResponseType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [BookResponseType], { nullable: true })
  books?: BookResponseType[];

  /**
   * Create a CollectionResponseType from a Collection entity
   */
  static fromEntity(collection: Collection, books: BookResponseType[] = []): CollectionResponseType {
    if (!collection) {
      // Create an empty response with default values for safety
      const empty = new CollectionResponseType();
      empty.id = '0';
      empty.name = 'Unknown Collection';
      empty.createdAt = new Date();
      empty.updatedAt = new Date();
      return empty;
    }
    
    const type = new CollectionResponseType();
    type.id = collection.id;
    type.name = collection.name;
    type.description = collection.description;
    type.createdAt = collection.createdAt;
    type.updatedAt = collection.updatedAt;
    type.books = books;
    
    return type;
  }
} 