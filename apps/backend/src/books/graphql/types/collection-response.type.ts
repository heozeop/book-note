import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CollectionResponseDto } from '../../dtos/collection.response.dto';
import { BookResponseType } from './book-response.type';

@ObjectType()
export class CollectionResponseType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [BookResponseType], { nullable: true })
  books?: BookResponseType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  static fromDto(dto: CollectionResponseDto): CollectionResponseType {
    const type = new CollectionResponseType();
    type.id = dto.id;
    type.name = dto.name;
    type.description = dto.description;
    type.books = dto.books?.map(book => BookResponseType.fromDto(book));
    type.createdAt = dto.createdAt;
    type.updatedAt = dto.updatedAt;
    return type;
  }
} 